import { Grid, Stack, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { BaseFilterValues } from '../../models/Filters';
import { SearchType } from '../../models/DebtPositions';
import useDebtPositionsSearch from '../../hooks/useDebtPositionsSearch';
import { IUVDataGrid } from './components/DebtPositionIUVDataGrid';
import { DebtPositionsDataGrid } from './components/DebtPositionsDataGrid';
import useDebtPositionFilters from '../../hooks/useDebtPositionsFilters';
import {
  PagedInstallmentView,
  PagedDebtPositionView
} from '../../../generated/apiClient';
import debtPositions from '../../api/debtPositions';
import { PageRoutes } from '../../App';

export type LocationState = {
  searchType: SearchType;
  filters: BaseFilterValues;
};

export type DebtResultsProps = {
  searchType: SearchType;
};

export const DebtPositionResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { filters: initialFilters, searchType }
  }: { state: LocationState } = useLocation();

  const debtPosition = useDebtPositionsSearch({
    initialFilters,
    requestFn:
      searchType === SearchType.IUV
        ? debtPositions.getInstallments
        : debtPositions.getDebtPositionViews
  });

  const { filters } = useDebtPositionFilters({
    searchType,
    onFilter: debtPosition.applyFilters
  });

  const DataGrid =
    searchType === SearchType.IUV ? IUVDataGrid : DebtPositionsDataGrid;

  return (
    <Stack gap={5}>
      <TitleComponent
        title={
          searchType === SearchType.IUV
            ? t('DebtPositions.Results.titleIUV')
            : t('DebtPositions.Results.title')
        }
        callToAction={[
          {
            icon: searchType === SearchType.IUV ? null : <Add />,
            buttonText:
              searchType === SearchType.IUV
                ? t('commons.createNewOne')
                : t('commons.createNew'),
            onActionClick: () =>
              navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD)
          }
        ]}
      />
      <Stack gap={3}>
        <FilterContainer
          items={filters}
          values={debtPosition.filterValues}
          onChange={debtPosition.handleFilterChange}
        />
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
          <DataGrid
            data={
              debtPosition.query.data as PagedInstallmentView &
                PagedDebtPositionView
            }
            onPageChange={debtPosition.handlePageChange}
            onPageSizeChange={debtPosition.handlePageSizeChange}
            onSortChange={debtPosition.setSort}
            pagination={debtPosition.pagination}
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default DebtPositionResults;
