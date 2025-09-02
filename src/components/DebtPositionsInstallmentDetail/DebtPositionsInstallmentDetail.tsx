import { Download, History, ReadMore, Visibility } from '@mui/icons-material';
import { Button, Divider, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import EmptyDetailContainer from './EmptyDetailContainer';
import { InstallmentStatus } from '../../../generated/data-contracts';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import debtPositions from '../../api/debtPositions';
import {
  useLocation,
  useParams,
  useNavigate,
  generatePath
} from 'react-router';
import { PageRoutes } from '../../routes';
import { useEffect, useState } from 'react';
import { BredcrumbItem } from '../Breadcrumbs/Breadcrumbs';
import { InstallmentDetailDrawer } from './InstallmentDetailDrawer';
import { Timeline } from '../Timeline';
import { setAppState } from '../../store/AppStateStore';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';
import GenericDialog from '../GenericDialog/GenericDialog';
import { useTimelineData } from '../../hooks/useTimelineData';

export const DebtPositionsInstallmentDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useStore();
  const { id } = useParams<{ id: string }>();

  const {
    state: { remittanceInformation: remittanceInformation }
  } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const installmentId = Number(id);

  if (isNaN(installmentId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
    return null;
  }

  const {
    data: installment,
    isError,
    error
  } = debtPositions.getInstallmentDetail(organizationId, installmentId);

  useEffect(() => {
    if (isError && error) {
      console.error('Error loading installment detail:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [isError, error, navigate]);

  const statusInstallment = installment?.status;

  const {
    mutate: fetchInstallmentRegistries,
    data: installmentRegistries = []
  } = debtPositions.getInstallmentRegistriesMutation();

  const downloadMutation = debtPositions.getPaymentNoticeFile(
    organizationId,
    installment?.debtPositionId || 0,
    installment?.iuv || ''
  );

  const handleTimelineOpen = () => {
    setTimelineOpen(true);

    if (installment?.debtPositionId && installment?.nav) {
      fetchInstallmentRegistries({
        organizationId,
        debtPositionId: installment.debtPositionId,
        nav: installment.nav
      });
    }
  };

  const timelineElements = useTimelineData(installmentRegistries);

  const handleDownloadInstallment = async () => {
    try {
      if (!installment?.iuv || !installment.debtPositionId) {
        return utils.notify.emit(t('commons.files.missingIuv'), 'error');
      }
      if (statusInstallment !== InstallmentStatus.UNPAID) {
        return setOpenDeleteDialog(true);
      }
      const result = await downloadMutation.mutateAsync();
      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('commons.files.downloadFailed'), 'error');
    }
  };

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

  const DEBT_RESOLVED_STATES: Array<InstallmentStatus> = [
    InstallmentStatus.PAID,
    InstallmentStatus.REPORTED
  ];
  const isResolved =
    installment?.status && DEBT_RESOLVED_STATES.includes(installment.status);

  type DetailDataValue = Record<string, Array<DetailData>> | Array<DetailData>;

  const summaryTitle: string = remittanceInformation || '';

  const installmentDetailData: DetailDataValue = {
    summaryData: [
      ...(installment?.debtPositionDescription
        ? [
            {
              value: installment.debtPositionDescription,
              variant: 'h6' as const
            }
          ]
        : []),
      {
        label: t('commons.state'),
        value: installment?.status
          ? t(`commons.status.${installment.status}`)
          : '',
        chipConfig: { color: 'default', variant: 'outlined' }
      },
      {
        label: t('debtPositionSearchResults.iuv'),
        value: installment?.iuv || '',
        variant: 'monospaced'
      },
      {
        label: t('debtPositionSearchResults.amount'),
        value: installment?.amountCents as number,
        valueType: 'amount'
      },
      {
        label: t('debtPositionSearchResults.expirationDate'),
        value: installment?.dueDate,
        valueType: 'date'
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
      },
      {
        label: t('commons.notificationDate'),
        value: installment?.notificationDate,
        valueType: 'date'
      },
      {
        label: t('commons.notificationFeeCents'),
        value: installment?.notificationFeeCents as number,
        valueType: 'amount'
      },
      {
        label: t('commons.iun'),
        value: installment?.iun || ''
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
      setAppState({
        loading: false,
        customBreadcrumbsItems: customBreadcrumbsItems
      });
    }
  }, [installment]);

  return (
    <>
      <TitleComponent
        title={t('commons.routes.DEBT_POSITION_INSTALLMENT_DETAIL')}
        callToAction={[
          {
            icon: <History />,
            variant: 'text',
            onActionClick: handleTimelineOpen
          },
          ...(statusInstallment !== InstallmentStatus.DRAFT &&
          statusInstallment !== InstallmentStatus.CANCELLED
            ? [
                {
                  icon: <Download />,
                  variant: 'contained' as const,
                  buttonText: t('commons.downloadInstallment'),
                  onActionClick: handleDownloadInstallment
                }
              ]
            : [])
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

      <GenericDialog
        data-testid="confirm-delete-dialog"
        open={openDeleteDialog}
        title={t('debtPositionInstallmentDetail.dialogDownload.title')}
        message={t('debtPositionInstallmentDetail.dialogDownload.message')}
        confirmLabel={t('commons.close')}
        onConfirm={() => setOpenDeleteDialog(false)}
      />
    </>
  );
};

export default DebtPositionsInstallmentDetail;
