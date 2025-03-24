import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  ChipOwnProps,
  ChipProps
} from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { History, KeyboardArrowDown } from '@mui/icons-material';
import { theme } from '@pagopa/mui-italia';
import DetailContainer, {
  DetailData
} from '../../components/DetailContainer/DetailContainer';
import { useTranslation } from 'react-i18next';
import { PaymentOptionSection } from './components/PaymentOptionSection';
import { format, parseISO } from 'date-fns';
import { PaymentOptionDTO, InstallmentDTO } from '../../../generated/apiClient';
import debtPositions from '../../api/debtPositions';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { generatePath, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageRoutes } from '../../App';
import { setLoading } from '../../store/AppStateStore';
import { Timeline } from '../../components/Timeline';

export type PaymentOptionDisplayData = {
  title: string;
  tag: string;
  chip: { label: string; color: ChipOwnProps['color'] };
  details: Array<DetailData>;
  installments: Array<InstallmentRow>;
};

type InstallmentRow = {
  id: number;
  iuv: string;
  subject: string;
  amount: number;
  expirationDate: string;
  status: string;
};

const DebtPositionDetail = () => {
  const { t } = useTranslation();
  const { state, setState } = useStore();
  const { id } = useParams<{ id: string }>();

  const stateColors: Record<string, ChipProps['color']> = {
    CANCELLED: 'error',
    DRAFT: 'default',
    EXPIRED: 'error',
    PAID: 'success',
    PARTIALLY_PAID: 'info',
    REPORTED: 'success',
    TO_SYNC: 'default',
    UNPAID: 'info',
    INVALID: 'error'
  };

  type StateKey = keyof typeof stateColors;
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const debtPositionId = Number(id);

  const [timelineOpen, setTimelineOpen] = useState(false);

  const { data: debtPositionDetail, isLoading } =
    debtPositions.getDebtPositionDetail(organizationId, debtPositionId);

  setLoading(isLoading);

  useEffect(() => {
    if (debtPositionDetail?.paymentOptions?.length) {
      setState(STATE.APP_STATE, {
        customBreadcrumbsItems: [
          { pathname: PageRoutes.DEBT_POSITIONS_INDEX, id: 'DEBT_POSITIONS' },
          {
            pathname: generatePath(PageRoutes.DEBT_POSITION_DETAIL, {
              id: debtPositionDetail.paymentOptions[0].debtPositionId
            }),
            label: debtPositionDetail.debtPositionTypeOrgDescription || '',
            id: 'branch'
          }
        ]
      });
    }
  }, [debtPositionDetail?.paymentOptions]);

  const getStatusChipProps = (
    status: string
  ): { label: string; color: ChipOwnProps['color'] } => {
    const isValidStatus = Object.keys(stateColors).includes(status);

    if (!isValidStatus) {
      return {
        label: 'STATO SCONOSCIUTO',
        color: 'default'
      };
    }

    const statusKey = status as StateKey;
    return {
      label: t(`DebtPositions.Results.status.${statusKey}`) || status,
      color: stateColors[statusKey]
    };
  };

  const statusChip =
    debtPositionDetail && getStatusChipProps(debtPositionDetail.status);

  const debtorSection = debtPositionDetail && {
    data: [
      { label: t('commons.debtor'), value: debtPositionDetail.debtor.fullName },
      {
        label: t('commons.fiscalCodeorVat'),
        value: `${debtPositionDetail.debtor.fiscalCode} (${debtPositionDetail.debtor.entityType === 'F' ? t('commons.person') : t('commons.personLegal')})`
      },
      {
        label: t('commons.duetype'),
        value: debtPositionDetail.debtPositionTypeOrgDescription
      },
      { label: t('commons.internalCode'), value: debtPositionDetail.iupd }
    ] as Array<DetailData>,
    inline: true
  };

  const createInstallmentRow = (
    installment: InstallmentDTO,
    description: string
  ): InstallmentRow => {
    return {
      id: installment.installmentId ?? 0,
      iuv: installment.iuv ?? 'N/A',
      subject: installment.remittanceInformation || description || 'N/A',
      amount: installment.amountCents ?? 0,
      expirationDate: installment.dueDate
        ? format(parseISO(installment.dueDate), 'dd/MM/yyyy')
        : 'N/A',
      status: installment.status
        ? getStatusChipProps(installment.status).label
        : 'N/A'
    };
  };

  const createPaymentOptionDisplayData = (
    paymentOption: PaymentOptionDTO
  ): PaymentOptionDisplayData => {
    return {
      title:
        t(`commons.paymentOptions.${paymentOption.paymentOptionType}`) || 'N/A',
      tag: paymentOption.status
        ? getStatusChipProps(paymentOption.status).label
        : 'N/A',
      chip: paymentOption.status
        ? getStatusChipProps(paymentOption.status)
        : { label: 'N/A', color: 'default' },
      details: [
        {
          label: t('commons.description'),
          value: paymentOption.description ?? 'N/A'
        },
        {
          label: t('commons.amount'),
          value: paymentOption.totalAmountCents ?? 0
        }
      ],
      installments: (paymentOption.installments ?? []).map((installment) =>
        createInstallmentRow(installment, paymentOption.description ?? '')
      )
    };
  };

  const priorityType = ['SINGLE_INSTALLMENT', 'DOWN_PAYMENT', 'INSTALLMENTS'];

  const paymentOptionsDisplayData = (debtPositionDetail?.paymentOptions ?? [])
    .sort(
      (optionA, optionB) =>
        priorityType.indexOf(optionA.paymentOptionType) -
        priorityType.indexOf(optionB.paymentOptionType)
    )
    .map(createPaymentOptionDisplayData);

  return debtPositionDetail ? (
    <>
      <TitleComponent
        title={debtPositionDetail.debtPositionTypeOrgDescription}
        chip={statusChip}
        callToAction={[
          {
            icon: <History data-testid="HistoryButton" />,
            variant: 'text',
            onActionClick: () => setTimelineOpen(true)
          }
        ]}
      />
      <Box mt={3}>
        <Accordion
          disableGutters
          sx={{
            py: 3,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2
          }}
        >
          <AccordionSummary
            expandIcon={<KeyboardArrowDown color="primary" />}
            aria-controls="debt-position-detail"
          >
            <Typography variant="overline" ml={1}>
              {t('debtPositionDetail.debtPositionInfo')}
            </Typography>
          </AccordionSummary>
          {debtorSection && <DetailContainer sections={[debtorSection]} />}
        </Accordion>

        <Typography variant="h5" mb={2} mt={3}>
          {t('debtPositionDetail.paymentOptions')}
        </Typography>
      </Box>

      {paymentOptionsDisplayData.map((optionData, index) => (
        <PaymentOptionSection
          key={`option-${index}`}
          optionData={optionData}
          data-testid={`payment-option`}
        />
      ))}

      <Timeline.Drawer
        title={t('debtPositionDetail.timeline.title')}
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
      >
        <Timeline.Element
          date={new Date(2025, 2, 1, 14)}
          element={
            <Typography>
              {t('debtPositionDetail.timeline.message')} <b>XXXXXXXXXXX</b>
            </Typography>
          }
          first
        />
        <Timeline.Element
          date={new Date(2025, 3, 3, 9)}
          element={
            <Typography>
              {t('debtPositionDetail.timeline.message')} <b>XXXXXXXXXXX</b>
            </Typography>
          }
        />
        <Timeline.Element
          date={new Date()}
          element={
            <Typography>
              {t('debtPositionDetail.timeline.message')} <b>XXXXXXXXXXX</b>
            </Typography>
          }
          last
        />
      </Timeline.Drawer>
    </>
  ) : null;
};

export default DebtPositionDetail;
