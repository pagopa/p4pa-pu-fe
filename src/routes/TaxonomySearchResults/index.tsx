import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import TaxonomyDataGrid from './TaxonomyDataGrid';
import {
  TaxonomyFilter,
  SEARCH_FIELD_NAMES
} from '../../components/TaxonomyFilter';
import { FieldValues, FormProvider, useForm, Path } from 'react-hook-form';
import { FormComponent } from '../../components/FormComponent';
import { getTaxonomies } from '../../api/taxonomy';
import { useSearch } from '../../hooks/useSearch';
import utils from '../../utils';
import { useState, useMemo, useEffect } from 'react';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { PagedTaxonomy } from '../../../generated/apiClient';

const TaxonomySearchResults = () => {
  const { t } = useTranslation();

  //  Read initialFilters only ONCE using useMemo to prevent re-reading from URL on every render.
  const initialFilters: FieldValues = useMemo(() => {
    return utils.URI.decode(window.location.hash);
  }, []);

  const [error, setError] = useState(false);

  // Create form with defaultValues
  // Values from URL hash will be used as initial values
  const form = useForm({
    defaultValues: initialFilters
  });

  //  Clear defaultValues after first render to allow field clearing and reset form to empty, then repopulate with setValue (without defaultValues)
  useEffect(() => {
    const currentValues = form.getValues();

    // Reset form to empty object to clear all defaultValues
    form.reset({}, { keepValues: false, keepDefaultValues: false });

    // Repopulate form with current values without setting them as defaultValues
    Object.entries(currentValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.setValue(key as Path<FieldValues>, value, { shouldDirty: false });
      }
    });
  }, []);

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
              <TaxonomyFilter
                layout="singleRow"
                fieldNames={SEARCH_FIELD_NAMES}
              />
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
