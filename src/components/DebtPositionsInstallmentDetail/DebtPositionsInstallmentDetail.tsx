import { Download, History, ReadMore, Visibility } from '@mui/icons-material';
import { Button, Divider, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import EmptyDetailContainer from './EmptyDetailContainer';
import { InstallmentDTO } from '../../../generated/apiClient';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import debtPositions from '../../api/debtPositions';
import {
  useLocation,
  useParams,
  useNavigate,
  generatePath
} from 'react-router-dom';
import { PageRoutes } from '../../App';
import { useEffect, useState } from 'react';
import { BredcrumbItem } from '../Breadcrumbs/Breadcrumbs';
import { InstallmentDetailDrawer } from './InstallmentDetailDrawer';
import { Timeline } from '../Timeline';
import { setLoading } from '../../store/AppStateStore';

export const DebtPositionsInstallmentDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, setState } = useStore();
  const { id } = useParams<{ id: string }>();

  const {
    state: { remittanceInformation: remittanceInformation }
  } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  type DebtStatus = Pick<InstallmentDTO, 'status'>['status'];

  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const installmentId = Number(id);

  if (isNaN(installmentId)) {
    // TODO: raise error
    console.error('ID is not a number');
  }

  const { data: installment, isLoading } = debtPositions.getInstallmentDetail(
    organizationId,
    installmentId
  );

  setLoading(isLoading);

  const getFiscalCodeValue = (
    fiscalCode?: string,
    entityType?: string
  ): string => {
    if (!fiscalCode) {
      return '-';
    }

    const entityLabel = entityType === 'F' ? ` (${t('commons.person')})` : '';
    return `${fiscalCode}${entityLabel}`;
  };

  const DEBT_RESOLVED_STATES: Array<DebtStatus> = ['PAID', 'REPORTED'];
  const isResolved =
    installment?.status && DEBT_RESOLVED_STATES.includes(installment.status);

  type DetailDataValue = Record<string, Array<DetailData>> | Array<DetailData>;

  const summaryTitle: string = remittanceInformation || '';

  const installmentDetailData: DetailDataValue = {
    summaryData: [
      {
        label: t('commons.state'),
        value: installment?.status || '',
        chipConfig: { color: 'default', variant: 'outlined' }
      },
      {
        label: t('debtPositionSearchResults.iuv'),
        value: installment?.iuv || '',
        variant: 'monospaced'
      },
      {
        label: t('debtPositionSearchResults.amount'),
        value: installment?.amountCents as number
      },
      {
        label: t('debtPositionSearchResults.expirationDate'),
        value: installment?.dueDate
          ? new Date(installment?.dueDate).toLocaleDateString('it-IT')
          : ''
      },
      {
        label: t('commons.debtor'),
        value: installment?.debtor?.fullName || ''
      },
      {
        label: t('commons.fiscalCodeorVatExecutor'),
        value: getFiscalCodeValue(
          installment?.debtor?.fiscalCode,
          installment?.debtor?.entityType
        )
      },
      {
        label: t('commons.duetype'),
        value: installment?.debtPositionTypeOrgDescription || ''
      }
    ],
    paymentData: [
      {
        label: t('commons.paymentdate'),
        value: installment?.paymentDateTime
          ? new Date(installment?.paymentDateTime).toLocaleDateString('it-IT')
          : ''
      },
      {
        label: t('commons.executedBy'),
        value: installment?.payer?.fullName || ''
      },
      {
        label: t('commons.fiscalCodeorVatExecutor'),
        value: getFiscalCodeValue(
          installment?.payer?.fiscalCode,
          installment?.payer?.entityType
        )
      },
      {
        label: t('commons.transactionManager'),
        value: installment?.pspCompanyName || ''
      },
      { label: t('commons.iud'), value: installment?.iud || '' },
      { label: t('commons.iur'), value: installment?.iur || '' }
    ]
  };

  useEffect(() => {
    if (installment) {
      const customBreadcrumbsItems: Array<BredcrumbItem> = [
        { pathname: PageRoutes.DEBT_POSITIONS_INDEX, id: 'DEBT_POSITIONS' },
        {
          pathname: generatePath(PageRoutes.DEBT_POSITION_DETAIL, {
            id: installment.debtPositionId
          }),
          label: installment.debtPositionTypeOrgDescription || '',
          id: 'branch'
        },
        {
          pathname: generatePath(PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL, {
            id: installment.installmentId
          }),
          id: 'DEBT_POSITION_INSTALLMENT_DETAIL'
        }
      ];
      setState(STATE.APP_STATE, {
        loading: false,
        customBreadcrumbsItems: customBreadcrumbsItems
      });
    }
  }, [installment]);

  return !isLoading ? (
    <>
      <TitleComponent
        title={t('commons.routes.DEBT_POSITION_INSTALLMENT_DETAIL')}
        callToAction={[
          {
            icon: <History />,
            variant: 'text',
            onActionClick: () => setTimelineOpen(true)
          },
          {
            icon: <Download />,
            variant: 'contained',
            buttonText: t('commons.downloadInstallment'),
            onActionClick: () => console.log('download')
          }
        ]}
      />
      <Grid container spacing={3}>
        <Grid item md={6}>
          <DetailContainer
            sections={[
              {
                title: { label: t(summaryTitle), variant: 'h6' },
                data: installmentDetailData.summaryData,
                inline: true,
                footerLink: {
                  label: t('commons.showDebtPositions'),
                  icon: <Visibility />,
                  onLinkClick: () =>
                    navigate(
                      generatePath(PageRoutes.DEBT_POSITION_DETAIL, {
                        id: installment?.debtPositionId
                      })
                    )
                }
              }
            ]}
          />
        </Grid>
        <Grid item md={6}>
          {isResolved ? (
            <DetailContainer
              sections={[
                {
                  title: {
                    label: t('commons.paymentInformation'),
                    variant: 'overline'
                  },
                  data: installmentDetailData.paymentData,
                  divider: true
                }
              ]}
            />
          ) : (
            <EmptyDetailContainer />
          )}
        </Grid>
      </Grid>
      <Divider
        orientation="horizontal"
        flexItem
        sx={{ display: 'block', mt: 3 }}
      />
      <Grid container mt={1}>
        <Button
          size="large"
          endIcon={<ReadMore />}
          variant="text"
          fullWidth={false}
          onClick={() => setDrawerOpen(true)}
        >
          {t('commons.showOtherBeneficiaries')}
        </Button>
      </Grid>
      <InstallmentDetailDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        title={t('debtPositionInstallmentDetail.drawer.title')}
        installmentId={installmentId}
        organizationId={organizationId}
      />
      <Timeline.Drawer
        title={t('debtPositionInstallmentDetail.timeline.title')}
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
      >
        <Timeline.Element
          date={new Date(2025, 2, 1, 14)}
          element={
            <Typography>
              {t('debtPositionInstallmentDetail.timeline.message')}{' '}
              <b>XXXXXXXXXXX</b>
            </Typography>
          }
          first
        />
        <Timeline.Element
          date={new Date(2025, 3, 3, 9)}
          element={
            <Typography>
              {t('debtPositionInstallmentDetail.timeline.message')}{' '}
              <b>XXXXXXXXXXX</b>
            </Typography>
          }
        />
        <Timeline.Element
          date={new Date()}
          element={
            <Typography>
              {t('debtPositionInstallmentDetail.timeline.message')}{' '}
              <b>XXXXXXXXXXX</b>
            </Typography>
          }
          last
        />
      </Timeline.Drawer>
    </>
  ) : null;
};

export default DebtPositionsInstallmentDetail;
