import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Stack, useTheme } from '@mui/material';
import TitleComponent from '../TitleComponent/TitleComponent';
import SearchResultsDataGrid from './ReportingDataGrid';
import { BaseFilterValues } from '../../models/Filters';
import { PagedPaymentsReportingView } from '../../../generated/data-contracts';
import useReportingSearch, {
  ReportingFilters
} from '../../hooks/useReportingSearch';
import useReportingFilters from '../../hooks/useReportingFilters';
import FilterContainer from '../FilterContainer/FilterContainer';

export type LocationState = {
  filters: BaseFilterValues;
};

const ReportingSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { state } = useLocation() as { state?: LocationState };

  const initialFilters = state?.filters ?? {};

  const reporting = useReportingSearch({
    initialFilters: initialFilters as ReportingFilters
  });

  const { filters } = useReportingFilters({
    onFilter: () => {
      reporting.applyFilters();
    }
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
          values={reporting.filterValues}
          onChange={reporting.handleFilterChange}
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
            data={reporting.query.data as PagedPaymentsReportingView}
            onSortChange={reporting.setSort}
            onPaginationChange={reporting.handlePaginationChange}
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default ReportingSearchResults;
