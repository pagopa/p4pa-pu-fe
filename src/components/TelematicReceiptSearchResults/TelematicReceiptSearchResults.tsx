import { Grid, Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { BaseFilterValues } from '../../models/Filters';
import useTelematicReceiptSearch, {
  TelematicReceiptFilters
} from '../../hooks/useTelematicReceiptsSearch';
import { useLocation } from 'react-router-dom';
import useTelematicReceiptsFilters from '../../hooks/useTelematicReceiptsFilters';
import FilterContainer from '../FilterContainer/FilterContainer';
import { PagedReceiptView } from '../../../generated/data-contracts';

export type LocationState = {
  filters: BaseFilterValues;
};

const TelematicReceiptSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const location = useLocation();

  const initialFilters = (location.state?.filters || {}) as BaseFilterValues;

  const telematicReceipt = useTelematicReceiptSearch({
    initialFilters: initialFilters as TelematicReceiptFilters
  });

  const { filters } = useTelematicReceiptsFilters({
    onFilter: telematicReceipt.applyFilters
  });

  return (
    <Stack>
      <TitleComponent
        title={t('commons.routes.TELEMATIC_RECEIPT_SEARCH_RESULTS')}
        description={t('telematicreceiptSearchResults.description')}
      />

      <Stack gap={3}>
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
            onPageChange={telematicReceipt.handlePageChange}
            onPageSizeChange={telematicReceipt.handlePageSizeChange}
            onSortChange={telematicReceipt.setSort}
            pagination={telematicReceipt.pagination}
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default TelematicReceiptSearchResults;
