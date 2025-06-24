import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { BaseFilterValues } from '../../models/Filters';
import useTelematicReceiptSearch, {
  TelematicReceiptFilters
} from '../../hooks/useTelematicReceiptsSearch';
import { useLocation } from 'react-router';
import useTelematicReceiptsFilters from '../../hooks/useTelematicReceiptsFilters';
import FilterContainer from '../FilterContainer/FilterContainer';
import { PagedReceiptView } from '../../../generated/data-contracts';
import { ReactNode, useState } from 'react';
import { noFilterSetted } from '../../utils/filtersValidation';

export type LocationState = {
  filters: BaseFilterValues;
};

const TelematicReceiptSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const [error, setError] = useState(false);

  const errorMessage: ReactNode = (
    <Typography variant="body2" color="error" data-testid="filters-error-text">
      {t('commons.filters.atLeastOneFilter')}
    </Typography>
  );

  const initialFilters = (location.state?.filters || {}) as BaseFilterValues;

  const telematicReceipt = useTelematicReceiptSearch({
    initialFilters: initialFilters as TelematicReceiptFilters
  });

  const runSearch = () => {
    if (!noFilterSetted(telematicReceipt.filterValues)) {
      telematicReceipt.applyFilters();
      setError(false);
    } else {
      setError(true);
    }
  };
  const { filters } = useTelematicReceiptsFilters({
    onFilter: runSearch
  });

  return (
    <Stack>
      <TitleComponent
        title={t('commons.routes.TELEMATIC_RECEIPT_SEARCH_RESULTS')}
        description={t('telematicreceiptSearchResults.description')}
      />
      <Stack gap={3}>
        {error && errorMessage}
        <FilterContainer
          items={filters}
          values={telematicReceipt.filterValues}
          onChange={telematicReceipt.handleFilterChange}
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
            data={telematicReceipt.query.data as PagedReceiptView}
            onSortChange={telematicReceipt.setSort}
            onPaginationChange={telematicReceipt.handlePaginationChange}
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default TelematicReceiptSearchResults;
