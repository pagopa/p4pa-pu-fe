import { Grid, Stack, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useState, useCallback, useMemo } from 'react';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { BaseFilterValues } from '../../models/Filters';
import { SearchType } from '../../models/DebtPositions';
import { IUVDataGrid } from './components/DebtPositionIUVDataGrid';
import { DebtPositionsDataGrid } from './components/DebtPositionsDataGrid';
import useDebtPositionFilters from '../../hooks/useDebtPositionsFilters';
import {
  PagedInstallmentView,
  PagedDebtPositionView
} from '../../../generated/apiClient';
import debtPositions from '../../api/debtPositions';
import { PageRoutes } from '../../routes';
import { useSearch } from '../../hooks/useSearch';
import { useStore } from '../../store/GlobalStore';
import { GridSortModel } from '@mui/x-data-grid';

export const DebtPositionResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract initial state from location.state or fallback
  const { searchType: locationSearchType, filters: locationFilters } =
    location.state ?? {};

  // Determine searchType with fallback based on pathname
  const searchType = useMemo<SearchType>(() => {
    if (locationSearchType) return locationSearchType;
    return location.pathname.includes('results-IUV')
      ? SearchType.IUV
      : SearchType.DEBT_POSITION;
  }, [location.pathname, locationSearchType]);

  // Filters from location or empty object fallback
  const initialFilters = locationFilters ?? {};
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

  // Filters UI logic
  const { filters } = useDebtPositionFilters({
    searchType,
    onFilter: debtPosition.applyFilters
  });

  // Sort state
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Handle sort changes
  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);

      const apiSort = model.map(
        (item) => `${item.field},${item.sort === 'desc' ? 'DESC' : 'ASC'}`
      );

      debtPosition.setSort(apiSort.length > 0 ? apiSort : []);
      debtPosition.applyFilters();
    },
    [debtPosition]
  );

  // Select DataGrid component based on searchType
  const DataGrid =
    searchType === SearchType.IUV ? IUVDataGrid : DebtPositionsDataGrid;

  // Call to action button config
  const callToAction = useMemo(
    () => [
      {
        icon: searchType === SearchType.IUV ? null : <Add />,
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

  return (
    <Stack gap={5}>
      <TitleComponent title={title} callToAction={callToAction} />
      <Stack gap={3}>
        <FilterContainer
          items={filters}
          values={filterValues}
          onChange={(id, value) =>
            setFilterValues({ ...filterValues, [id]: value })
          }
        />
        <Grid
          container
          p={2}
          height="100%"
          sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }}
          aria-label="results-table"
        >
          <DataGrid
            data={
              debtPosition.query.data as PagedInstallmentView &
                PagedDebtPositionView
            }
            onSortChange={handleSortModelChange}
            sortModel={sortModel}
            onPaginationChange={debtPosition.handlePaginationChange}
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default DebtPositionResults;
