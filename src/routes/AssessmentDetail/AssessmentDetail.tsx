import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Grid, Typography, useTheme, Button, Box, Chip } from '@mui/material';
import { Add, RemoveCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { hasPartialDateRangeErrors } from '../../utils/filtersValidation';
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
import { getAssessmentDetail } from '../../api/assessments/assessmentDetail/assessmentDetail';
import { AssessmentsDetail } from '../../../generated/apiClient';
import { Variant } from '@mui/material/styles/createTypography';
import { PageRoutes } from '../../routes';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { getAssessmentStatusChipProps } from '../../utils/assessmentHelpers';
import AssesmentActionMenu from '../../components/Assessment/AssessmentActionMenu';
import { setAppState } from '../../store/AppStateStore';
import { BredcrumbItem } from '../../components/Breadcrumbs/Breadcrumbs';
import utils from '../../utils';
import { FieldValues } from 'react-hook-form';
import { useSearch } from '../../hooks/useSearch';
import { FilterFieldValue } from '../../models/Filters';
import { AssessmentDetailFilters } from '../../api/assessments/mappings';
import { FilterFieldIds } from '../../models/SearchCardFields';

export const AssessmentDetail = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const assessmentId = Number(id);
  const [initialFilters] = useState<FieldValues>(() =>
    utils.URI.decode(window.location.hash)
  );
  const {
    state: { organizationId }
  } = useStore();
  const [detailItem, setDetailItem] = useState<AssessmentsDetail | null>(null);
  const [appliedFilters, setAppliedFilters] =
    useState<AssessmentDetailFilters>(initialFilters);
  // State for saving the total payments when there are no active filters
  // This value is used to determine if the "Remove" button should be shown independently of the applied filters
  const [totalPaymentsWithoutFilters, setTotalPaymentsWithoutFilters] =
    useState<number | null>(null);
  // Ref to track if we have already made the initial call without filters
  // This prevents multiple calls when the page is loaded with filters
  const hasFetchedInitialTotal = useRef(false);

  const query = getAssessmentDetail(organizationId, assessmentId);
  const { data, isPending, isError, error } = query;

  const { applyFilters } = useSearch({ query, filters: appliedFilters });

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
            `${t('assessment.assessment')} ${assessmentId}`,
          id: 'ASSESSMENT_DETAIL'
        }
      ];
      setAppState({
        loading: false,
        customBreadcrumbsItems: customBreadcrumbsItems
      });
    }
  }, [detailItem, assessmentId, data?.assessmentsName]);

  useEffect(() => {
    if (!assessmentId || isNaN(assessmentId)) {
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [assessmentId, navigate]);

  const hasActiveFilters = useCallback(
    (filters: AssessmentDetailFilters): boolean => {
      // Check if there are active filters: IUV, update date, or outcome date
      return (
        (filters.iuv && filters.iuv.trim() !== '') ||
        !!filters.update?.from ||
        !!filters.update?.to ||
        !!filters.outcome?.from ||
        !!filters.outcome?.to
      );
    },
    []
  );

  // Handles the initial case: if the page is loaded with filters in the URL hash, make a call API without filters to get the real total payments
  useEffect(() => {
    // If we have already made this call, don't make it again
    if (hasFetchedInitialTotal.current) {
      return;
    }

    const hasInitialFilters = hasActiveFilters(initialFilters);

    // If the page is loaded with filters and we have the necessary parameters, make a call API without filters to get the real total payments
    // facciamo una chiamata API senza filtri per ottenere il totale reale
    if (
      hasInitialFilters &&
      organizationId &&
      assessmentId &&
      !isNaN(assessmentId)
    ) {
      hasFetchedInitialTotal.current = true;
      query
        .mutateAsync({
          filters: {},
          pagination: { page: 0, size: 1 },
          sort: []
        })
        .then((response) => {
          const totalElements =
            response?.pagedAssessmentsRowsDetail?.totalElements;
          if (totalElements != null) {
            setTotalPaymentsWithoutFilters(totalElements);
          }
        })
        .catch((error) => {
          console.error(
            'Error fetching total payments without filters:',
            error
          );
          // Reset il flag in caso di errore per permettere un nuovo tentativo
          hasFetchedInitialTotal.current = false;
        });
    }
  }, [initialFilters, organizationId, assessmentId, hasActiveFilters]);

  // Save the total payments when there are no active filters
  // This value is used to determine if the "Remove" button should be shown independently of the applied filters
  // independently of the filters applied subsequently
  useEffect(() => {
    const hasFilters = hasActiveFilters(appliedFilters);
    const totalElements = data?.pagedAssessmentsRowsDetail?.totalElements;

    // Save the total only if:
    // 1. There are no active filters (to have the real total, not filtered)
    // 2. The data is available (totalElements is defined)
    if (!hasFilters && totalElements !== undefined) {
      setTotalPaymentsWithoutFilters(totalElements);
    }
  }, [appliedFilters, data?.pagedAssessmentsRowsDetail?.totalElements]);

  const canModifyAssessment = () => {
    const hasManualGeneration = data?.flagManualGeneration === true;
    const isActive = data?.status !== undefined && data.status === 'ACTIVE';

    return hasManualGeneration && isActive;
  };

  const shouldShowButtons = useMemo(() => {
    return canModifyAssessment();
  }, [data?.flagManualGeneration, data?.status]);

  const shouldShowRemoveButton = useMemo(() => {
    if (!shouldShowButtons) {
      return false;
    }

    // Use the saved total without filters if available, otherwise use the current totalElements
    // This ensures that the button is visible if the assessment has payments,
    // independently of the filters applied
    const totalPayments =
      totalPaymentsWithoutFilters ??
      data?.pagedAssessmentsRowsDetail?.totalElements ??
      0;

    return totalPayments > 0;
  }, [
    shouldShowButtons,
    totalPaymentsWithoutFilters,
    data?.pagedAssessmentsRowsDetail?.totalElements
  ]);

  const showCannotModifyDialog = () =>
    utils.dialog.open({
      title: t('assessmentDetail.cannotModifyDialog.title'),
      message: t('assessmentDetail.cannotModifyDialog.description'),
      confirmLabel: t('commons.close'),
      onConfirm: utils.dialog.close,
      onClose: utils.dialog.close,
      'data-testid': 'cannot-modify-payments-dialog'
    });

  const handleRemovePayments = () => {
    if (!canModifyAssessment()) {
      showCannotModifyDialog();
      return;
    }

    const debtPositionTypeOrgCode =
      data?.debtPositionTypeOrgCode || detailItem?.debtPositionTypeOrgCode;

    const searchParams = new URLSearchParams({
      mode: 'remove',
      assessmentId: assessmentId.toString(),
      from: 'detail',
      debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
      assessmentName: data?.assessmentsName || ''
    });

    navigate(`${PageRoutes.ASSESSMENT_CREATION}?${searchParams.toString()}`, {
      state: {
        mode: 'remove',
        assessmentId: assessmentId,
        assessmentName: data?.assessmentsName,
        debtPositionTypeOrgCode: debtPositionTypeOrgCode,
        fromAssessmentDetail: true
      }
    });
  };

  const handleAddPayments = () => {
    if (!canModifyAssessment()) {
      showCannotModifyDialog();
      return;
    }

    const debtPositionTypeOrgCode =
      data?.debtPositionTypeOrgCode || detailItem?.debtPositionTypeOrgCode;

    const searchParams = new URLSearchParams({
      mode: 'add',
      assessmentId: assessmentId.toString(),
      from: 'detail',
      debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
      assessmentName: data?.assessmentsName || ''
    });
    if (debtPositionTypeOrgCode) {
      navigate(`${PageRoutes.ASSESSMENT_CREATION}?${searchParams.toString()}`, {
        state: {
          mode: 'add',
          assessmentId: assessmentId,
          assessmentName: data?.assessmentsName,
          debtPositionTypeOrgCode: debtPositionTypeOrgCode,
          fromAssessmentDetail: true
        }
      });
    } else {
      utils.notify.emit(
        t('assessmentDetail.error.debtPositionTypeOrgCodeNotDefined')
      );
      console.error(
        'debtPositionTypeOrgCode not defined',
        debtPositionTypeOrgCode
      );
    }
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

  const handleFilterChange = (id: string, value: FilterFieldValue) => {
    setAppliedFilters((prevFilters) => ({
      ...prevFilters,
      [id]: value
    }));
  };

  /**
   * Validates filters before applying them to prevent API calls with partial date ranges.
   * Shows notification if there are validation errors.
   */
  const handleApplyFilters = useCallback(() => {
    // Check if there are partial date range errors (only 'from' or only 'to' filled)
    if (hasPartialDateRangeErrors(appliedFilters)) {
      // Don't apply filters if there are partial date range errors
      // The DateRange component already shows visual error messages
      return;
    }

    // Apply filters if validation passes
    applyFilters(appliedFilters);
  }, [appliedFilters, applyFilters]);

  return (
    <>
      <TitleComponent
        title={
          data?.assessmentsName ||
          `${t('assessment.assessment')} ${assessmentId || ''}`
        }
        callToAction={[
          <AssesmentActionMenu
            key={'AssesmentActionMenu'}
            flagManualGeneration={data?.flagManualGeneration}
            status={data?.status}
          />
        ]}
        accessibleTitle={t('assessmentDetail.accessibleTitle', {
          assessmentId: data?.assessmentsName,
          interpolation: { escapeValue: false }
        })}
      />
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
            {shouldShowRemoveButton && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<RemoveCircleOutline />}
                onClick={handleRemovePayments}
                data-testid="remove-payments-button"
              >
                {t('commons.remove')}
              </Button>
            )}
            {shouldShowButtons && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddPayments}
                data-testid="add-payments-button"
              >
                {t('commons.add')}
              </Button>
            )}
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
            onChange={handleFilterChange}
            values={appliedFilters}
            items={[
              {
                id: FilterFieldIds.IUV_CODE,
                type: COMPONENT_TYPE.textField,
                label: t('commons.search') + ' IUV',
                adornment: <Search />,
                gridWidth: 2
              },
              {
                type: COMPONENT_TYPE.dateRange,
                label: 'outcome',
                gridWidth: 4,
                from: {
                  label: t('commons.outcomeFrom')
                },
                to: {
                  label: t('commons.to')
                }
              },
              {
                type: COMPONENT_TYPE.dateRange,
                label: 'update',
                gridWidth: 5,
                from: {
                  label: t('commons.updatedFrom')
                },
                to: {
                  label: t('commons.to')
                }
              },
              {
                type: COMPONENT_TYPE.button,
                label: t('commons.filters.filterResults'),
                gridWidth: 1,
                onClick: handleApplyFilters
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
          data-testid="results-table"
        >
          <AssessmentDetailDataGrid data={data} isLoading={isPending} />
        </Grid>
      </Grid>
    </>
  );
};

export default AssessmentDetail;
