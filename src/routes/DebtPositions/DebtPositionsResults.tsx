import { Grid, Stack, useTheme, Button } from '@mui/material';
import { Add, FilterAlt } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useState, useMemo } from 'react';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import FilterContainerDrawer from '../../components/FilterContainerDrawer/FilterContainerDrawer';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { BaseFilterValues } from '../../models/Filters';
import { SearchType } from '../../models/DebtPositions';
import { IUVDataGrid } from './components/DebtPositionIUVDataGrid';
import { DebtPositionsDataGrid } from './components/DebtPositionsDataGrid';
import useDebtPositionFilters from '../../hooks/useDebtPositionsFilters';
import {
  PagedInstallmentView,
  PagedDebtPositionView
} from '../../../generated/core/client';
import debtPositions from '../../api/debtPositions';
import { PageRoutes } from '../../routes';
import { useSearch } from '../../hooks/useSearch';
import { useStore } from '../../store/GlobalStore';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import {
  isValidFiscalCodeOrPIVA,
  normalizeFiscalCodeOrPIVA,
  normalizeCompact
} from '../../utils/fieldValidation';
import utils from '../../utils';
import { clearFieldError, setFieldError } from '../../utils/filterErrors';

export const DebtPositionResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Extract initial state from location.state or fallback
  const { searchType: locationSearchType } = location.state ?? {};
  const initialFilters = utils.URI.decode(window.location.hash);

  // Determine searchType with fallback based on pathname
  const searchType = useMemo<SearchType>(() => {
    if (locationSearchType) return locationSearchType;
    return location.pathname.includes('results-IUV')
      ? SearchType.IUV
      : SearchType.DEBT_POSITION;
  }, [location.pathname, locationSearchType]);

  // Check if we should use drawer layout (only for IUV search type)
  const useDrawerLayout = searchType === SearchType.IUV;

  // Filters from location or empty object fallback
  const [filterValues, setFilterValues] = useState(initialFilters);

  // Get organizationId from global store
  const {
    state: { organizationId }
  } = useStore();

  // Choose query based on searchType
  const query =
    searchType === SearchType.IUV
      ? debtPositions.getInstallments({ organizationId })
      : debtPositions.getDebtPositionViews({ organizationId });

  // Use search hook
  const debtPosition = useSearch<
    BaseFilterValues,
    PagedInstallmentView | PagedDebtPositionView
  >({
    filters: filterValues,
    query
  });

  const applyFilters = () => {
    let nextValues = { ...filterValues };

    // Normalize IUV if present
    const iuv = filterValues?.iuv as string | undefined;
    if (iuv && typeof iuv === 'string' && iuv.trim() !== '') {
      const normalizedIUV = normalizeCompact(iuv);
      nextValues = {
        ...nextValues,
        iuv: normalizedIUV
      };
    }

    // Validate fiscalCode if present
    const fiscalCode = filterValues?.fiscalCode as string | undefined;
    if (fiscalCode && fiscalCode.trim() !== '') {
      // Normalize the value (remove spaces, uppercase)
      const normalizedFiscalCode = normalizeFiscalCodeOrPIVA(fiscalCode);
      if (!isValidFiscalCodeOrPIVA(normalizedFiscalCode)) {
        setFilterValues(
          (prev) =>
            setFieldError(
              prev,
              'fiscalCode',
              t('commons.validation.invalidFiscalCodeOrVat')
            ) as typeof prev
        );
        return;
      }
      // Update with normalized value and clear error if validation passes
      nextValues = {
        ...nextValues,
        fiscalCode: normalizedFiscalCode,
        fiscalCode_error: ''
      };
    }

    // Persist normalized values in state
    if (iuv || fiscalCode) {
      setFilterValues(nextValues);
    }

    if (!noFilterSetted(nextValues)) {
      debtPosition.applyFilters(nextValues);
      setError(false);
      // Close drawer after successful filter application
      if (useDrawerLayout) {
        setFilterDrawerOpen(false);
      }
    } else {
      setError(shouldShowGeneralError(nextValues));
    }
  };

  const resetFilters = () => {
    setFilterValues({});
    setError(false);
  };

  const handleFilterChange = (id: string, value: unknown) => {
    if (id === 'fiscalCode' && filterValues?.fiscalCode_error) {
      setFilterValues(
        (prev) =>
          clearFieldError(
            {
              ...prev,
              [id]: value as string
            },
            'fiscalCode'
          ) as typeof prev
      );
    } else if (id === 'fiscalCode_error') {
      setFilterValues((prev) => ({
        ...prev,
        [id]: value as string
      }));
    } else {
      setFilterValues((filterValues) => ({
        ...filterValues,
        [id]: value as string
      }));
    }
  };

  const { filters } = useDebtPositionFilters({
    searchType
  });

  // Select DataGrid component based on searchType
  const DataGrid =
    searchType === SearchType.IUV ? IUVDataGrid : DebtPositionsDataGrid;

  // Call to action button config
  const callToAction = useMemo(
    () => [
      {
        icon: <Add />,
        buttonText:
          searchType === SearchType.IUV
            ? t('commons.createNewOne')
            : t('commons.createNew'),
        onActionClick: () => navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD)
      }
    ],
    [searchType, t, navigate]
  );

  // Title text
  const title = useMemo(
    () =>
      searchType === SearchType.IUV
        ? t('DebtPositions.Results.titleIUV')
        : t('DebtPositions.Results.title'),
    [searchType, t]
  );

  const accessibleTitle = useMemo(
    () =>
      searchType === SearchType.IUV
        ? t('DebtPositions.Results.accessibleTitleIUV')
        : t('DebtPositions.Results.accessibleTitleDP'),
    [searchType, t]
  );

  const activeFiltersCount = useMemo(() => {
    if (!filterValues) return 0;
    return Object.entries(filterValues).filter(([key, value]) => {
      if (key.endsWith('_error')) return false;
      if (value === '' || value == null || value == undefined) return false;
      if (
        typeof value === 'object' &&
        value != null &&
        ('from' in value || 'to' in value)
      ) {
        const dateRange = value as { from?: Date | null; to?: Date | null };
        return dateRange.from !== null || dateRange.to !== null;
      }
      return true;
    }).length;
  }, [filterValues]);

  const filterButtonLabel = useMemo(() => {
    const baseLabel = t('commons.filters.filtersField');
    return activeFiltersCount > 0
      ? `${baseLabel} (${activeFiltersCount})`
      : baseLabel;
  }, [t, activeFiltersCount]);

  return (
    <Stack gap={searchType === SearchType.IUV ? 3 : 5}>
      <TitleComponent
        title={title}
        callToAction={callToAction}
        accessibleTitle={accessibleTitle}
      />
      <Stack gap={3}>
        {error && !useDrawerLayout && <ErrorMessage variant="outlined" />}

        {useDrawerLayout ? (
          // IUV Search: Use drawer for filters
          <>
            <Button
              variant="text"
              onClick={() => setFilterDrawerOpen(true)}
              startIcon={<FilterAlt />}
              sx={{ alignSelf: 'flex-end' }}
            >
              {filterButtonLabel}
            </Button>

            <FilterContainerDrawer
              open={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              title={t('commons.filters.filter')}
              items={filters}
              values={filterValues}
              onChange={handleFilterChange}
              onSubmit={applyFilters}
              showError={error}
              titleVariant="overline"
              buttons={[
                {
                  buttonText: t('commons.search'),
                  variant: 'contained'
                },
                {
                  buttonText: t('commons.filters.remove'),
                  variant: 'text',
                  onClick: resetFilters
                }
              ]}
            />
          </>
        ) : (
          // Debt Position Search: Use inline filters
          <FilterContainer
            items={filters}
            values={filterValues}
            onChange={handleFilterChange}
            onSubmit={applyFilters}
          />
        )}

        <Grid
          container
          p={2}
          height="100%"
          sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }}
        >
          <DataGrid
            data={
              debtPosition.query.data as PagedInstallmentView &
                PagedDebtPositionView
            }
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default DebtPositionResults;
