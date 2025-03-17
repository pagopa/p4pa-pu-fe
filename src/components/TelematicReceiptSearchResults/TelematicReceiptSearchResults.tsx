import {
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  useTheme
} from '@mui/material';
import { CalendarToday, Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { BaseFilterValues } from '../../models/Filters';
import useTelematicReceiptSearch from '../../hooks/useTelematicReceiptsSearch';
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

  const {
    state: { filters: initialFilters }
  }: { state: LocationState } = useLocation();

  const telematicReceipts = useTelematicReceiptSearch({
    initialFilters
  });

  
  const { filters } = useTelematicReceiptsFilters({
    onFilter: telematicReceipts.applyFilters
  }); 


  return (
    <Stack >
      <TitleComponent
        title={t('commons.routes.TELEMATIC_RECEIPT_SEARCH_RESULTS')}
        description={t('telematicreceiptSearchResults.description')}
      />

      <Stack gap={3}>
        <FilterContainer
          items={filters}
          values={telematicReceipts.filterValues}
          onChange={telematicReceipts.handleFilterChange}
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
              data={
                telematicReceipts.query.data as PagedReceiptView}
              onPageChange={telematicReceipts.handlePageChange}
              onPageSizeChange={telematicReceipts.handlePageSizeChange}
              onSortChange={telematicReceipts.setSort}
              pagination={telematicReceipts.pagination}
            />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default TelematicReceiptSearchResults;
