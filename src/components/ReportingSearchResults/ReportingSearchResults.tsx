import { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Stack, useTheme } from '@mui/material';
import TitleComponent from '../TitleComponent/TitleComponent';
import SearchResultsDataGrid from './ReportingDataGrid';
import { BaseFilterValues } from '../../models/Filters';
import { PagedPaymentsReportingView } from '../../../generated/data-contracts';
import useReportingSearch from '../../hooks/useReportingSearch';
import usePaginationSync from '../../hooks/usePaginationSync';
import useReportingFilters from '../../hooks/useReportingFilters';
import FilterContainer from '../FilterContainer/FilterContainer';

export type LocationState = {
  filters: BaseFilterValues;
};

const ReportingSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [totalElements, setTotalElements] = useState<number>(0);
  const { state } = useLocation() as { state?: LocationState };

  const initialFilters = state?.filters ?? {};

  // Se non c'è "page" nell’URL, la setto a '1'; se non c'è "size", la setto a '10'
  const pageFromUrl = parseInt(searchParams.get('page') || '1');
  const sizeFromUrl = parseInt(searchParams.get('size') || '10');

  const reportingSearch = useReportingSearch({
    initialFilters: initialFilters,
    initialPage: pageFromUrl - 1, // -1 perché la pagina è 1-based
    initialSize: sizeFromUrl,
    totalElements
  });

  const { filters } = useReportingFilters({
    onFilter: () => {
      reportingSearch.applyFilters();
      // forzo la pagina a 0
      handlePageChange(0 + 1);
    }
  });

  const { handlePageChange, handlePageSizeChange } = usePaginationSync({
    paginationData: reportingSearch.query.data,
    onPageChange: reportingSearch.handlePageChange,
    onPageSizeChange: reportingSearch.handlePageSizeChange,
    totalElements,
    setTotalElements
  });

  return (
    <Stack>
      <TitleComponent
        title={t('commons.routes.REPORTING_SEARCH_RESULTS')}
        description={t('reportingSearchResults.description')}
      />
      <Stack gap={3}>
        <FilterContainer
          items={filters}
          values={reportingSearch.filterValues}
          onChange={reportingSearch.handleFilterChange}
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
          <SearchResultsDataGrid
            data={reportingSearch.query.data as PagedPaymentsReportingView}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={reportingSearch.setSort}
            pagination={reportingSearch.pagination}
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default ReportingSearchResults;
