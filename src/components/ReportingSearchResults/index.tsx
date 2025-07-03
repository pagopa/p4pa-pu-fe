import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Grid, Stack, Typography, useTheme } from '@mui/material';
import TitleComponent from '../TitleComponent/TitleComponent';
import SearchResultsDataGrid from './ReportingDataGrid';
import { BaseFilterValues } from '../../models/Filters';
import { PagedPaymentsReportingView } from '../../../generated/data-contracts';
import useReportingFilters from '../../hooks/useReportingFilters';
import FilterContainer from '../FilterContainer/FilterContainer';
import { ReactNode, useState } from 'react';
import { noFilterSetted } from '../../utils/filtersValidation';
import { useStore } from '../../store/GlobalStore';
import { getPaymentsReporting } from '../../api/getPaymentsReporting';
import { useSearch } from '../../hooks/useSearch';

export type LocationState = {
  filters: BaseFilterValues;
};

const ReportingSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  const errorMessage: ReactNode = (
    <Typography variant="body2" color="error" data-testid="filters-error-text">
      {t('commons.filters.atLeastOneFilter')}
    </Typography>
  );

  const { state } = useLocation() as { state?: LocationState };

  const initialFilters = state?.filters ?? {};

  const {
    state: { organizationId }
  } = useStore();

  const query = getPaymentsReporting({ organizationId });

  const reporting = useSearch({
    initialFilters,
    query
  });

  const runSearch = () => {
    if (!noFilterSetted(reporting.filters)) {
      reporting.applyFilters();
      setError(false);
    } else {
      setError(true);
    }
  };

  const { filters } = useReportingFilters({
    onFilter: runSearch
  });

  return (
    <Stack>
      <TitleComponent
        title={t('commons.routes.REPORTING_SEARCH_RESULTS')}
        description={t('reportingSearchResults.description')}
      />
      <Stack gap={3}>
        {error && errorMessage}
        <FilterContainer
          items={filters}
          values={reporting.filters}
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
