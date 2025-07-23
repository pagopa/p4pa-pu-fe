import { useTranslation } from 'react-i18next';
import { Grid, Stack, useTheme } from '@mui/material';
import SearchResultsDataGrid from './ReportingDataGrid';
import { PagedPaymentsReportingView } from '../../../generated/data-contracts';
import { ReportingFilters } from '../../hooks/useReportingFilters';
import { useStore } from '../../store/GlobalStore';
import { getPaymentsReporting } from '../../api/getPaymentsReporting';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { noFilterSetted } from '../../utils/filtersValidation';
import { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import utils from '../../utils';

export type LocationState = {
  filters: FieldValues;
};

const ReportingSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);
  const [error, setError] = useState(false);
  const form = useForm({ defaultValues: initialFilters });

  const {
    state: { organizationId }
  } = useStore();

  const query = getPaymentsReporting({ organizationId });

  const reporting = useSearch({
    filters: initialFilters,
    query
  });

  const applyFilters = (filters: FieldValues) => {
    if (noFilterSetted(filters)) {
      setError(true);
    } else {
      setError(false);
      reporting.applyFilters(filters);
    }
  };

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(applyFilters)}>
        <Stack>
          <TitleComponent
            title={t('commons.routes.REPORTING_SEARCH_RESULTS')}
            description={t('reportingSearchResults.description')}
          />
          <Stack gap={3}>
            <ReportingFilters error={error} />
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
                onSortChange={reporting.onSortChange}
                onPaginationChange={reporting.handlePaginationChange}
              />
            </Grid>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default ReportingSearchResults;
