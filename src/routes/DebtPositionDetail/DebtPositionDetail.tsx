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
import { generatePath, useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { PageRoutes } from '../../routes';
import { setCustomBreadcrumbsItems } from '../../store/AppStateStore';
import { Timeline } from '../../components/Timeline';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import { useQueryClient } from '@tanstack/react-query';
import utils from '../../utils';
import { downloadBlob } from '../../utils/download';
import { useTimelineData } from '../../hooks/useTimelineData';
import { isDateInPast, moneyFormat } from '../../utils/formatters';

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
      if (debtPositionDetail?.status === DebtPositionStatus.TO_SYNC) {
        return t('debtPositionDetail.toSyncErrorDialog.description');
      }
      return t('debtPositionDetail.errorDialog.description');
    }
  };

  type StateKey = keyof typeof stateColors;
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const debtPositionId = Number(id);

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const {
    data: debtPositionDetail,
    isError,
    error
  } = debtPositions.getDebtPositionDetail(organizationId, debtPositionId);

  const { mutate: fetchRegistries, data: registries = [] } =
    debtPositions.getDebtPositionRegistriesMutation();

  const timelineElements = useTimelineData(registries);

  const deleteDebtPositionMutation = debtPositions.deleteDebtPosition(
    organizationId,
    debtPositionId
  );

  const publishDebtPositionMutation = debtPositions.publishDebtPosition(
    organizationId,
    debtPositionId
  );

  const canBeDeleted =
    debtPositionDetail?.status !== DebtPositionStatus.PAID &&
    debtPositionDetail?.status !== DebtPositionStatus.PARTIALLY_PAID &&
    debtPositionDetail?.status !== DebtPositionStatus.TO_SYNC;

  const canBeEdited =
    debtPositionDetail?.status === DebtPositionStatus.DRAFT ||
    debtPositionDetail?.status === DebtPositionStatus.UNPAID ||
    debtPositionDetail?.status === DebtPositionStatus.EXPIRED;

  const showDeleteOption =
    debtPositionDetail?.status !== DebtPositionStatus.CANCELLED;
  const showEditOption =
    debtPositionDetail?.debtPositionOrigin === DebtPositionOrigin.ORDINARY;

  const showDownloadCTA =
    debtPositionDetail?.status !== DebtPositionStatus.DRAFT &&
    debtPositionDetail?.status !== DebtPositionStatus.CANCELLED;

  const showActivatePaymentCTA =
    debtPositionDetail?.status === DebtPositionStatus.DRAFT;

  const menuOpen = Boolean(menuAnchorEl);

  const handleTimelineOpen = () => {
    setTimelineOpen(true);

    fetchRegistries({
      organizationId,
      debtPositionId
    });
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    showDeleteDialog();
  };

  useEffect(() => {
    if (isError && error) {
      console.error('Error loading debt position detail:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [isError, error, navigate]);

  const handleDeleteConfirm = async () => {
    if (!canBeDeleted) {
      setDialogConfig(null);
      return;
    }

    try {
      await deleteDebtPositionMutation.mutateAsync();
      setDialogConfig(null);
      if (debtPositionDetail?.status === DebtPositionStatus.DRAFT) {
        navigate(generatePath(PageRoutes.DEBT_POSITIONS_INDEX));
      } else {
        queryClient.invalidateQueries({
          queryKey: ['getDebtPositionDetail', organizationId, debtPositionId]
        });
      }
    } catch (error) {
      console.error('Error while deleting the debt position:', error);
      setDialogConfig(null);
      navigate(PageRoutes.RESPONSES_ERROR);
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

  const showEditErrorDialog = () => {
    const isToSyncStatus =
      debtPositionDetail?.status === DebtPositionStatus.TO_SYNC;

    setDialogConfig({
      open: true,
      title: t('debtPositionDetail.editErrorDialog.title'),
      message: isToSyncStatus
        ? t('debtPositionDetail.toSyncEditErrorDialog.description')
        : t('debtPositionDetail.editErrorDialog.description'),
      confirmLabel: t('commons.close'),
      onConfirm: () => setDialogConfig(null),
      onClose: () => setDialogConfig(null),
      testId: 'edit-error-dialog'
    });
  };

  const showPublishDialog = () => {
    setDialogConfig({
      open: true,
      title: t('debtPositionDetail.publishDialog.title'),
      message: t('debtPositionDetail.publishDialog.description'),
      confirmLabel: t('debtPositionDetail.publishDialog.confirmLabel'),
      cancelLabel: t('commons.close'),
      onConfirm: handlePublishConfirm,
      onClose: () => setDialogConfig(null),
      testId: 'confirm-publish-dialog'
    });
  };

  const hasExpiredDueDates = (): boolean => {
    if (!debtPositionDetail?.paymentOptions) return false;

    return debtPositionDetail.paymentOptions.some((paymentOption) =>
      paymentOption.installments?.some(
        (installment) =>
          installment.dueDate && isDateInPast(installment.dueDate)
      )
    );
  };

  const handleActivePayment = () => {
    showPublishDialog();
  };

  const handlePublishConfirm = async () => {
    if (hasExpiredDueDates()) {
      setDialogConfig(null);
      utils.notify.emit(
        t('debtPositionCreateWizard.step3.dueDate.futureDate'),
        'error'
      );
      return;
    }
    try {
      await publishDebtPositionMutation.mutateAsync();
      setDialogConfig(null);
      queryClient.invalidateQueries({
        queryKey: ['getDebtPositionDetail', organizationId, debtPositionId]
      });
    } catch (error) {
      console.error('Error while publishing the debt position:', error);
      setDialogConfig(null);
      utils.notify.emit(t('debtPositionDetail.publishError'), 'error');
    }
  };

  const getDebtPositionZipFileMutation =
    debtPositions.getDebtPositionZipFile(organizationId);

  const handleDownloadNotices = async () => {
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
      const result =
        await getDebtPositionZipFileMutation.mutateAsync(debtPositionId);
      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(t('commons.files.downloadFailed'), error);
      utils.notify.emit(t('commons.files.downloadFailed'));
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
        label: t('commons.DP_STATUS.UNKNOWN'),
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
      {
        label: t('commons.debtor'),
        value: debtPositionDetail.debtor.fullName
      },
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
          value: moneyFormat(paymentOption.totalAmountCents) ?? 0
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
      (optionA: PaymentOptionDTO, optionB: PaymentOptionDTO) =>
        priorityType.indexOf(optionA.paymentOptionType) -
        priorityType.indexOf(optionB.paymentOptionType)
    )
    .map(createPaymentOptionDisplayData);

  const handleEdit = () => {
    handleMenuClose();
    if (canBeEdited && showEditOption) {
      navigate(
        generatePath(PageRoutes.DEBT_POSITION_CREATE_WIZARD, {
          id: debtPositionId.toString()
        }),
        {
          state: {
            isEditing: true,
            debtPositionId: debtPositionId
          }
        }
      );
    } else {
      showEditErrorDialog();
    }
  };

  return debtPositionDetail ? (
    <>
      <TitleComponent
        title={
          debtPositionDetail.description ||
          debtPositionDetail.debtPositionTypeOrgDescription
        }
        chip={statusChip}
        callToAction={[
          ...(showDownloadCTA
            ? [
                {
                  icon: <GetApp data-testid="DownloadButton" />,
                  variant: 'contained' as const,
                  buttonText: t('debtPositionDetail.downloadNotices'),
                  onActionClick: handleDownloadNotices
                }
              ]
            : []),
          ...(showActivatePaymentCTA
            ? [
                {
                  icon: undefined,
                  variant: 'contained' as const,
                  buttonText: t('debtPositionDetail.activePayment'),
                  onActionClick: handleActivePayment
                }
              ]
            : []),
          {
            icon: <History data-testid="HistoryButton" />,
            variant: 'text',
            onActionClick: handleTimelineOpen
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
            <MenuItem onClick={handleEdit}>
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
        <>
          {timelineElements.length > 0 ? (
            timelineElements.map((element, index) => (
              <Timeline.Element
                key={index}
                date={element.date}
                element={element.content}
                first={element.isFirst}
                last={element.isLast}
                statusChip={element.statusChip}
              />
            ))
          ) : (
            <Timeline.Element
              date={new Date()}
              element={<Typography>{t('commons.NO_EVENTS')}</Typography>}
              first={true}
              last={true}
            />
          )}
        </>
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
