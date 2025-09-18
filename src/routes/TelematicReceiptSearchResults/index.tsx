import { Grid, Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import { BaseFilterValues } from '../../models/Filters';
import useTelematicReceiptsFilters from '../../hooks/useTelematicReceiptsFilters';
import { PagedReceiptView } from '../../../generated/data-contracts';
import { useState } from 'react';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';
import { getReceipts } from '../../api/receipts';
import { useStore } from '../../store/GlobalStore';
import { useSearch } from '../../hooks/useSearch';
import { FieldValues } from 'react-hook-form';
import utils from '../../utils';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import FilterContainer from '../../components/FilterContainer/FilterContainer';

export type LocationState = {
  filters: BaseFilterValues;
};

const TelematicReceiptSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);
  const [filterValues, setFilterValues] = useState(initialFilters);

  const {
    state: { organizationId }
  } = useStore();

  const query = getReceipts({ organizationId });

  const telematicReceipt = useSearch({
    filters: filterValues,
    query
  });

  const applyFilters = () => {
    if (!noFilterSetted(filterValues)) {
      telematicReceipt.applyFilters(filterValues);
      setError(false);
    } else {
      setError(shouldShowGeneralError(filterValues));
    }
  };

  const { filters } = useTelematicReceiptsFilters({
    onFilter: applyFilters
  });

  return (
    <Stack>
      <TitleComponent
        title={t('commons.routes.TELEMATIC_RECEIPT_SEARCH_RESULTS')}
        accessibleTitle={t('telematicreceiptSearchResults.accessibleTitle')}
        description={t('telematicreceiptSearchResults.description')}
      />
      <Stack gap={3}>
        {error && <ErrorMessage variant="outlined" />}
        <FilterContainer
          items={filters}
          values={filterValues}
          onChange={(field, value) =>
            setFilterValues({ ...filterValues, [field]: value })
          }
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
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default TelematicReceiptSearchResults;
