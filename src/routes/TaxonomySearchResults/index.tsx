import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import { BaseFilterValues } from '../../models/Filters';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import TaxonomyDataGrid from './TaxonomyDataGrid';
import useTaxonomySearch from '../../hooks/useTaxonomySearch';
import { TaxonomyFilter } from '../../components/TaxonomyFilter';
import { useLocation } from 'react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaxonomyFields } from '../../models/Taxonomy';
import { FormComponent } from '../../components/FormComponent';

export type LocationState = {
  filters: BaseFilterValues;
};

const TaxonomySearchResults = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const initialFilters = (location.state?.filters || {}) as TaxonomyFields;

  const form = useForm<TaxonomyFields>({
    resolver: zodResolver(
      z.object({
        orgType: z.string({
          required_error: 'taxonomy.orgType.required'
        }),
        macroAreaCode: z.string().optional(),
        serviceTypeCode: z.string().optional(),
        collectingReason: z.string().optional(),
        taxonomyCode: z.string().optional()
      })
    ),
    mode: 'onTouched',
    defaultValues: initialFilters
  });

  const taxonomies = useTaxonomySearch({
    filterValues: form.getValues()
  });

  const onSubmit = () => {
    taxonomies.applyFilters();
  };

  return (
    <FormProvider {...form}>
      <Stack>
        <TitleComponent
          title={t('commons.routes.BACKOFFICE_TAXONOMY_SEARCH_RESULTS')}
        />
        <Stack gap={3}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stack direction="row" gap={3} alignItems="center">
              <TaxonomyFilter layout="singleRow" />
              <FormComponent.Button type="submit">Cerca</FormComponent.Button>
            </Stack>
          </form>
          <TaxonomyDataGrid
            onSortChange={taxonomies.setSort}
            isLoading={taxonomies.query.isPending}
            onPaginationChange={taxonomies.handlePaginationChange}
            data={
              taxonomies.query.data || {
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
