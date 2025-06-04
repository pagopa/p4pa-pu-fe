import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import { BaseFilterValues } from '../../models/Filters';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import TaxonomyDataGrid from './TaxonomyDataGrid';
import useTaxonomySearch, {
  TaxonomyFilters
} from '../../hooks/useTaxonomySearch';

export type LocationState = {
  filters: BaseFilterValues;
};

const TaxonomySearchResults = () => {
  const { t } = useTranslation();
  const initialFilters: TaxonomyFilters = {};

  const taxonomies = useTaxonomySearch({
    initialFilters: initialFilters as TaxonomyFilters
  });

  return (
    <Stack>
      <TitleComponent
        title={t('commons.routes.BACKOFFICE_TAXONOMY_SEARCH_RESULTS')}
      />
      <Stack gap={3}>
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
  );
};

export default TaxonomySearchResults;
