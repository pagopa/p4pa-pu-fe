import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  ChipOwnProps,
  ChipProps,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import {
  Delete,
  Edit,
  GetApp,
  History,
  KeyboardArrowDown,
  MoreVert
} from '@mui/icons-material';
import { theme } from '@pagopa/mui-italia';
import DetailContainer, {
  DetailData
} from '../../components/DetailContainer/DetailContainer';
import { useTranslation } from 'react-i18next';
import { PaymentOptionSection } from './components/PaymentOptionSection';
import { format, parseISO } from 'date-fns';
import {
  PaymentOptionDTO,
  InstallmentDTO,
  PaymentOptionTypeEnum,
  PaymentOptionStatus,
  DebtPositionStatus,
  InstallmentStatus,
  DebtPositionOrigin
} from '../../../generated/data-contracts';
import debtPositions from '../../api/debtPositions';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { generatePath, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageRoutes } from '../../App';
import { setCustomBreadcrumbsItems } from '../../store/AppStateStore';
import { Timeline } from '../../components/Timeline';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import { useQueryClient } from '@tanstack/react-query';
import utils from '../../utils';
import { downloadBlob } from '../../utils/download';

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
  chip: { label: string; color: ChipOwnProps['color'] } | undefined;
};

type DialogConfig = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  testId: string;
};

const DebtPositionDetail = () => {
  const { t } = useTranslation();
  const { state } = useStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const stateColors: Record<
    InstallmentStatus | DebtPositionStatus | PaymentOptionStatus,
    ChipProps['color']
  > = {
    CANCELLED: 'error',
    DRAFT: 'default',
    EXPIRED: 'error',
    PAID: 'success',
    PARTIALLY_PAID: 'info',
    REPORTED: 'success',
    TO_SYNC: 'default',
    UNPAID: 'info',
    INVALID: 'error',
    UNPAYABLE: 'error'
  };

  const genericDialogTitle = () => {
    return canBeDeleted
      ? t('debtPositionDetail.confirmDialog.title')
      : t('debtPositionDetail.errorDialog.title');
  };

  const getDraftConfirmationMessage = () => {
    if (debtPositionDetail?.status === DebtPositionStatus.DRAFT) {
      return t('debtPositionDetail.confirmDialog.descriptionDraft');
    } else {
      return t('debtPositionDetail.confirmDialog.description');
    }
  };

  const genericDialogDescription = () => {
    if (canBeDeleted) {
      return getDraftConfirmationMessage();
    } else {
      return t('debtPositionDetail.errorDialog.description');
    }
  };

  type StateKey = keyof typeof stateColors;
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const debtPositionId = Number(id);

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const { data: debtPositionDetail } = debtPositions.getDebtPositionDetail(
    organizationId,
    debtPositionId
  );

  const deleteDebtPositionMutation = debtPositions.deleteDebtPosition(
    organizationId,
    debtPositionId,
    () => {
      setDialogConfig(null);
      if (debtPositionDetail?.status === DebtPositionStatus.DRAFT) {
        navigate(generatePath(PageRoutes.DEBT_POSITIONS_INDEX));
      } else {
        queryClient.invalidateQueries({
          queryKey: ['getDebtPositionDetail', organizationId, debtPositionId]
        });
      }
    },
    (error) => {
      console.error('Error while deleting the debt position:', error);
      setDialogConfig(null);
      utils.notify.emit(t('debtPositionDetail.deleteError'), 'error');
    }
  );

  // Variable to determine if the debt position can be deleted
  const canBeDeleted =
    debtPositionDetail?.status !== DebtPositionStatus.PAID &&
    debtPositionDetail?.status !== DebtPositionStatus.PARTIALLY_PAID;

  // Variable to determine if the delete option should be shown in the menu
  const showDeleteOption =
    debtPositionDetail?.status !== DebtPositionStatus.CANCELLED;
  const showEditOption =
    debtPositionDetail?.debtPositionOrigin === DebtPositionOrigin.ORDINARY;

  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    showDeleteDialog();
  };

  const handleDeleteConfirm = () => {
    if (canBeDeleted) {
      deleteDebtPositionMutation.mutate();
    } else {
      setDialogConfig(null);
    }
  };

  const showDeleteDialog = () => {
    setDialogConfig({
      open: true,
      title: genericDialogTitle(),
      message: genericDialogDescription(),
      confirmLabel: canBeDeleted ? t('commons.delete') : t('commons.close'),
      cancelLabel: canBeDeleted ? t('commons.close') : undefined,
      onConfirm: handleDeleteConfirm,
      onClose: () => setDialogConfig(null),
      testId: 'confirm-delete-dialog'
    });
  };

  const showDownloadDialog = () => {
    setDialogConfig({
      open: true,
      title: t('debtPositionDetail.dialogDownload.title'),
      message: t('debtPositionDetail.dialogDownload.message'),
      confirmLabel: t('commons.close'),
      onConfirm: () => setDialogConfig(null),
      onClose: () => setDialogConfig(null),
      testId: 'download-dialog'
    });
  };

  const handleDownloadNotices = async () => {
    if (!debtPositionId) {
      utils.notify.emit(t('commons.files.missingDebtPositionId'), 'error');
      return;
    }

    const DOWNLOADABLE_STATES = [
      DebtPositionStatus.UNPAID,
      DebtPositionStatus.PARTIALLY_PAID
    ];

    if (
      !debtPositionDetail?.status ||
      !DOWNLOADABLE_STATES.includes(debtPositionDetail.status)
    ) {
      showDownloadDialog();
      return;
    }

    try {
      const result = await debtPositions.downloadDebtPositionZip(
        organizationId,
        debtPositionId
      );

      if (!result) {
        utils.notify.emit(t('commons.files.downloadFailed'), 'error');
        return;
      }

      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(t('commons.files.downloadFailed'), error);
      utils.notify.emit(t('commons.files.downloadFailed'), 'error');
    }
  };

  useEffect(() => {
    if (debtPositionDetail?.paymentOptions?.length) {
      setCustomBreadcrumbsItems([
        { pathname: PageRoutes.DEBT_POSITIONS_INDEX, id: 'DEBT_POSITIONS' },
        {
          pathname: generatePath(PageRoutes.DEBT_POSITION_DETAIL, {
            id: debtPositionDetail.paymentOptions[0].debtPositionId
          }),
          label: debtPositionDetail.debtPositionTypeOrgDescription || '',
          id: 'branch'
        }
      ]);
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
      label: t(`commons.status.${statusKey}`) || status,
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
        value: `${debtPositionDetail.debtor.fiscalCode} (${(debtPositionDetail.debtor.entityType as string) === 'F' ? t('commons.person') : t('commons.personLegal')})`
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
      status: installment.status || '',
      chip: installment.status
        ? getStatusChipProps(installment.status)
        : undefined
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

  const priorityType = [
    PaymentOptionTypeEnum.SINGLE_INSTALLMENT,
    PaymentOptionTypeEnum.DOWN_PAYMENT,
    PaymentOptionTypeEnum.INSTALLMENTS
  ];

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
        title={
          debtPositionDetail.description ||
          debtPositionDetail.debtPositionTypeOrgDescription
        }
        chip={statusChip}
        callToAction={[
          {
            icon: <GetApp data-testid="DownloadButton" />,
            variant: 'contained',
            buttonText: t('debtPositionDetail.downloadNotices'),
            onActionClick: handleDownloadNotices
          },
          {
            icon: <History data-testid="HistoryButton" />,
            variant: 'text',
            onActionClick: () => setTimelineOpen(true)
          },
          ...(showDeleteOption
            ? [
                {
                  icon: <MoreVert />,
                  variant: 'text' as const,
                  onActionClick: () => {
                    const button = document.activeElement as HTMLElement;
                    setMenuAnchorEl(button);
                  }
                }
              ]
            : [])
        ]}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <>
          {showEditOption && (
            <MenuItem onClick={() => console.log('edit')}>
              <Edit fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              {t('debtPositionDetail.edit')}
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
            <Delete fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
            {t('commons.delete')}
          </MenuItem>
        </>
      </Menu>

      <Box mt={4} mb={3}>
        <Accordion
          disableGutters
          sx={{
            py: 1.5,
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

        <Typography variant="h5" mb={2} mt={4}>
          {t('debtPositionDetail.paymentOptions')}
        </Typography>
      </Box>

      {paymentOptionsDisplayData.map((optionData, index) => (
        <Box key={`option-container-${index}`}>
          <PaymentOptionSection
            key={`option-${index}`}
            optionData={optionData}
            data-testid={`payment-option`}
          />
          {index < paymentOptionsDisplayData.length - 1 && (
            <Divider
              orientation="horizontal"
              flexItem
              sx={{ mb: 4, display: 'block' }}
            />
          )}
        </Box>
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

      {dialogConfig && (
        <GenericDialog
          data-testid={dialogConfig.testId}
          open={dialogConfig.open}
          title={dialogConfig.title}
          message={dialogConfig.message}
          confirmLabel={dialogConfig.confirmLabel}
          cancelLabel={dialogConfig.cancelLabel}
          onConfirm={dialogConfig.onConfirm}
          onClose={dialogConfig.onClose}
        />
      )}
    </>
  ) : null;
};

export default DebtPositionDetail;
