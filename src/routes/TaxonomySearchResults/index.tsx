import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import TaxonomyDataGrid from './TaxonomyDataGrid';
import { TaxonomyFilter } from '../../components/TaxonomyFilter';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { FormComponent } from '../../components/FormComponent';
import { getTaxonomies } from '../../api/taxonomy';
import { useSearch } from '../../hooks/useSearch';
import utils from '../../utils';
import { useState } from 'react';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { PagedTaxonomy } from '../../../generated/apiClient';

const TaxonomySearchResults = () => {
  const { t } = useTranslation();
  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);
  const [error, setError] = useState(false);
  const form = useForm({ defaultValues: initialFilters });

  const query = getTaxonomies();

  const taxonomies = useSearch({
    filters: initialFilters,
    query
  });

  const applyFilters = (filters: FieldValues) => {
    if (noFilterSetted(filters)) {
      setError(shouldShowGeneralError(filters));
    } else {
      setError(false);
      taxonomies.applyFilters(filters);
    }
  };

  return (
    <FormProvider {...form}>
      <Stack>
        <TitleComponent
          title={t('commons.routes.BACKOFFICE_TAXONOMY_SEARCH_RESULTS')}
          accessibleTitle={t('taxonomySearchResults.accessibleTitle')}
        />
        <Stack gap={3}>
          {error && <ErrorMessage variant="outlined" />}
          <form noValidate onSubmit={form.handleSubmit(applyFilters)}>
            <Stack direction="row" gap={3} alignItems="center">
              <TaxonomyFilter layout="singleRow" />
              <FormComponent.Button type="submit">Cerca</FormComponent.Button>
            </Stack>
          </form>
          <TaxonomyDataGrid
            isLoading={taxonomies.query.isPending}
            data={
              (taxonomies.query.data as PagedTaxonomy) || {
                content: [],
                size: 0,
                totalElements: 0,
                totalPages: 0,
                number: 0
              }
            }
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default TaxonomySearchResults;
