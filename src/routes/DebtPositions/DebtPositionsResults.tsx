import { Grid, Stack, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
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
  PagedDebtPositionView,
  InstallmentView,
  DebtPositionView
} from '../../../generated/apiClient';
import debtPositions from '../../api/debtPositions';
import { PageRoutes } from '../../routes';

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
  const location = useLocation();

  const searchType = useMemo((): SearchType => {
    if (location.state?.searchType) {
      return location.state.searchType;
    }

    const pathname = location.pathname;
    if (pathname.includes('results-IUV')) {
      return SearchType.IUV;
    }

    return SearchType.DEBT_POSITION;
  }, [location.state?.searchType, location.pathname]);

  const initialFilters = useMemo(
    () => (location.state?.filters || {}) as BaseFilterValues,
    [location.state?.filters]
  );

  const requestFn = useMemo(
    () =>
      searchType === SearchType.IUV
        ? debtPositions.getInstallments
        : debtPositions.getDebtPositionViews,
    [searchType]
  );

  const debtPosition = useDebtPositionsSearch({
    initialFilters,
    requestFn
  });

  const { filters } = useDebtPositionFilters({
    searchType,
    onFilter: debtPosition.applyFilters
  });

  const DataGrid = useMemo(
    () => (searchType === SearchType.IUV ? IUVDataGrid : DebtPositionsDataGrid),
    [searchType]
  );

  const shouldRenderDataGrid = useCallback(() => {
    if (!debtPosition.query.data) return false;

    if (searchType === SearchType.IUV) {
      const hasValidInstallmentIds = debtPosition.query.data.content?.every(
        (item: DebtPositionView | InstallmentView) =>
          'installmentId' in item && item.installmentId != null
      );
      if (!hasValidInstallmentIds) {
        console.warn(
          'DebtPositionResults - Data IUV without installmentId, skip rendering'
        );
        return false;
      }
    }

    if (searchType === SearchType.DEBT_POSITION) {
      const hasValidDebtPositionIds = debtPosition.query.data.content?.every(
        (item: DebtPositionView | InstallmentView) =>
          'debtPositionId' in item && item.debtPositionId != null
      );
      if (!hasValidDebtPositionIds) {
        console.warn(
          'DebtPositionResults - Data DEBT_POSITION without debtPositionId, skip rendering'
        );
        return false;
      }
    }

    return true;
  }, [debtPosition.query.data, searchType]);

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
          {shouldRenderDataGrid() && (
            <DataGrid
              data={
                debtPosition.query.data as PagedInstallmentView &
                  PagedDebtPositionView
              }
              onSortChange={debtPosition.handleSortModelChange}
              sortModel={debtPosition.sortModel}
              onPaginationChange={debtPosition.handlePaginationChange}
            />
          )}
        </Grid>
      </Stack>
    </Stack>
  );
};

export default DebtPositionResults;
