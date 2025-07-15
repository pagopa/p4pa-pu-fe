import { useEffect, useState, useMemo } from 'react';
import {
  Grid,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  Button,
  Box,
  Chip
} from '@mui/material';
import {
  Close,
  Delete,
  MoreVert,
  Add,
  RemoveCircleOutline
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DetailContainer, {
  DetailData
} from '../../components/DetailContainer/DetailContainer';
import { useParams, useNavigate, generatePath } from 'react-router';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import { Search } from '@mui/icons-material';
import AssessmentDetailDataGrid from './components/AssessmentDetailDataGrid';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { getAssessmentDetail } from '../../api/assessments/assessmentDetail/assessmentDetail';
import { useAssessmentDetailFilters } from '../../hooks/useAssessmentDetailFilters';
import { AssessmentsDetail } from '../../../generated/apiClient';
import { Variant } from '@mui/material/styles/createTypography';
import { PageRoutes } from '../../routes';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import { setAppState } from '../../store/AppStateStore';
import { BredcrumbItem } from '../../components/Breadcrumbs/Breadcrumbs';
import { getAssessmentStatusChipProps } from '../../utils/assessmentHelpers';

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

export const AssessmentDetail = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const assessmentId = id ? Number(id) : null;
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  if (!assessmentId || isNaN(assessmentId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
    return null;
  }

  const [detailItem, setDetailItem] = useState<AssessmentsDetail | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const menuOpen = Boolean(menuAnchorEl);

  const {
    appliedFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    sortModel,
    handleSortModelChange,
    handleDateFromChange,
    handleDateToChange,
    handlePaymentDateFromChange,
    handlePaymentDateToChange
  } = useAssessmentDetailFilters({
    initialFilters: {
      page: 0,
      size: 10
    }
  });

  const { data, isLoading, isError, error } = getAssessmentDetail(
    organizationId,
    assessmentId,
    appliedFilters,
    { enabled: !!organizationId && !!assessmentId }
  );

  useEffect(() => {
    if (isError && error) {
      console.error('Error loading assessment details:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [isError, error, navigate]);

  useEffect(() => {
    if (data?.pagedAssessmentsRowsDetail?.content?.[0] && !detailItem) {
      setDetailItem(data.pagedAssessmentsRowsDetail.content[0]);
    }
  }, [data, detailItem]);

  // Handle custom breadcrumb
  useEffect(() => {
    if ((detailItem || data?.assessmentsName) && assessmentId) {
      const customBreadcrumbsItems: Array<BredcrumbItem> = [
        { pathname: PageRoutes.ASSESSMENT_INDEX, id: 'ASSESSMENT' },
        {
          pathname: PageRoutes.ASSESSMENT_SEARCH_RESULTS,
          id: 'ASSESSMENT_SEARCH_RESULTS'
        },
        {
          pathname: generatePath(PageRoutes.ASSESSMENT_DETAIL, {
            id: assessmentId.toString()
          }),
          label:
            data?.assessmentsName ||
            detailItem?.debtPositionTypeOrgCode ||
            `Accertamento ${assessmentId}`,
          id: 'ASSESSMENT_DETAIL'
        }
      ];
      setAppState({
        loading: false,
        customBreadcrumbsItems: customBreadcrumbsItems
      });
    }
  }, [detailItem, assessmentId, data?.assessmentsName]);

  const handleFiltersApplied = () => {
    applyFilters();
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleClose = () => {
    handleMenuClose();
  };

  const handleDelete = () => {
    handleMenuClose();
    showDeleteDialog();
  };

  const showDeleteDialog = () => {
    setDialogConfig({
      open: true,
      title: t('assessmentDetail.deleteDialog.title'),
      message: t('assessmentDetail.deleteDialog.description'),
      confirmLabel: t('commons.delete'),
      cancelLabel: t('commons.cancel'),
      onConfirm: handleDeleteConfirm,
      onClose: () => setDialogConfig(null),
      testId: 'confirm-delete-dialog'
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      // TODO: Implement the API call to delete the assessment
      console.log('Deleting assessment:', assessmentId);
      setDialogConfig(null);
      // For now, navigate back, in the future implement the delete call
      navigate(-1);
    } catch (error) {
      console.error('Error while deleting the assessment:', error);
      setDialogConfig(null);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  };

  const handleRemovePayments = () => {
    console.log('Remove payments clicked');
  };

  const handleAddPayments = () => {
    console.log('Add payments clicked');
  };

  /**
   * Handle navigation to the assessment detail record
   * @param assessmentDetailId - ID of the assessment detail
   */
  const handleNavigateToDetailDetail = (assessmentDetailId: number) => {
    const detailUrl = generatePath(PageRoutes.ASSESSMENT_DETAIL_DETAIL, {
      id: assessmentId.toString(),
      assessmentDetailId: assessmentDetailId.toString()
    });

    // Navigate to the detail page in the same tab
    navigate(detailUrl);
  };

  // Configuration sections for the DetailContainer
  const detailSections = useMemo(() => {
    const firstAssessmentItem = detailItem;

    const statusChipProps = data?.status
      ? getAssessmentStatusChipProps(data.status, t)
      : null;

    const summaryData: Array<DetailData> = [
      {
        label: t('commons.state'),
        value: statusChipProps?.label || '-',
        childrenComponent: statusChipProps ? (
          <Chip
            label={statusChipProps.label}
            color={statusChipProps.color}
            variant="filled"
            size="small"
          />
        ) : undefined
      },
      {
        label: t('assessmentDetail.debtType'),
        value:
          data?.debtPositionTypeOrgDescription ||
          firstAssessmentItem?.debtPositionTypeOrgCode ||
          '-'
      },
      {
        label: t('assessmentDetail.createdBy'),
        value:
          data?.updateOperatorExternalId ||
          firstAssessmentItem?.updateOperatorExternalId ||
          '-'
      }
    ];

    return [
      {
        title: { label: t('commons.summary'), variant: 'overline' as Variant },
        data: [...summaryData],
        inline: true
      }
    ];
  }, [
    detailItem,
    assessmentId,
    t,
    data?.status,
    data?.debtPositionTypeOrgDescription,
    data?.updateOperatorExternalId
  ]);

  return (
    <>
      <TitleComponent
        title={data?.assessmentsName || `Accertamento ${assessmentId || ''}`}
        callToAction={[
          {
            icon: <MoreVert />,
            variant: 'text' as const,
            onActionClick: () => {
              const button = document.activeElement as HTMLElement;
              setMenuAnchorEl(button);
            }
          }
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
        <MenuItem onClick={handleClose}>
          <Close fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          {t('commons.close')}
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
          {t('commons.delete')}
        </MenuItem>
      </Menu>

      <Grid container spacing={2}>
        <Grid item md={12}>
          <DetailContainer sections={detailSections} />
        </Grid>
      </Grid>

      <Grid container marginTop={4}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            mb: 2
          }}
        >
          <Typography variant="h6">
            {t('assessmentDetail.paymentsAssociated')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RemoveCircleOutline />}
              onClick={handleRemovePayments}
              data-testid="remove-payments-button"
            >
              {t('commons.remove')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddPayments}
              data-testid="add-payments-button"
            >
              {t('commons.add')}
            </Button>
          </Box>
        </Box>
        <Grid
          container
          direction="row"
          my={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <FilterContainer
            items={[
              {
                type: COMPONENT_TYPE.textField,
                label: t('commons.search') + ' IUV',
                adornment: <Search />,
                gridWidth: 2,
                value: draftFilters.iuv || '',
                onChange: (e) => updateDraftFilters({ iuv: e.target.value })
              },
              {
                type: COMPONENT_TYPE.dateRange,
                label: 'dateRange1',
                gridWidth: 4,
                from: {
                  label: t('commons.from'),
                  value: draftFilters.paymentDateTimeFrom
                    ? new Date(draftFilters.paymentDateTimeFrom)
                    : null,
                  onChange: handlePaymentDateFromChange
                },
                to: {
                  label: t('commons.to'),
                  value: draftFilters.paymentDateTimeTo
                    ? new Date(draftFilters.paymentDateTimeTo)
                    : null,
                  onChange: handlePaymentDateToChange
                }
              },
              {
                type: COMPONENT_TYPE.dateRange,
                label: 'dateRange2',
                gridWidth: 5,
                from: {
                  label: t('commons.updatedFrom'),
                  value: draftFilters.updateDateTimeFrom
                    ? new Date(draftFilters.updateDateTimeFrom)
                    : null,
                  onChange: handleDateFromChange
                },
                to: {
                  label: t('commons.to'),
                  value: draftFilters.updateDateTimeTo
                    ? new Date(draftFilters.updateDateTimeTo)
                    : null,
                  onChange: handleDateToChange
                }
              },
              {
                type: COMPONENT_TYPE.button,
                label: t('commons.filters.filterResults'),
                gridWidth: 1,
                onClick: handleFiltersApplied
              }
            ]}
          />
        </Grid>
        <Grid
          container
          p={2}
          height="100%"
          sx={{
            bgcolor: theme.palette.grey[200],
            overflow: 'auto'
          }}
          aria-label="results-table"
        >
          <AssessmentDetailDataGrid
            rows={data?.pagedAssessmentsRowsDetail?.content || []}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            isLoading={isLoading}
            smartPagination={{
              initialPage: 0,
              initialSize: 10,
              sizeOptions: [5, 10, 20],
              backendData: {
                totalElements: data?.pagedAssessmentsRowsDetail?.totalElements,
                totalPages: data?.pagedAssessmentsRowsDetail?.totalPages,
                number: data?.pagedAssessmentsRowsDetail?.number,
                size: data?.pagedAssessmentsRowsDetail?.size
              },
              onFiltersApplied: handleFiltersApplied
            }}
            onNavigateToDetail={handleNavigateToDetailDetail}
          />
        </Grid>
      </Grid>

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
  );
};

export default AssessmentDetail;
