import { Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import { useState } from 'react';
import {
  FilterCategory,
  FilterMap,
  useMultiFilters
} from '../../hooks/useMultiFilters';
import { BaseFilterValues } from '../../models/Filters';
import { useSearch } from '../../hooks/useSearch';
import { useStore } from '../../store/GlobalStore';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { FilterDrawer } from '../../components/Drawer/FilterDrawer';
import { SearchResultsDataGrid } from './SearchResultDataGrid';
import { getAssessmentsRegistries } from '../../api/assessments';
import { useNavigate } from 'react-router';
import { PageRoutes } from '..';

export type LocationState = {
  category: string;
  filters: BaseFilterValues;
  filterMap: FilterMap;
};

export const AssessmentsRegistrySearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { filterMap, selectedFilters, removeAllFilters, filterValues } =
    useMultiFilters({ filterCategory: FilterCategory.ASSESSMENTS_REGISTRY });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const {
    state: { organizationId }
  } = useStore();

  const query = getAssessmentsRegistries({ organizationId });

  const assessments = useSearch({
    filters: filterValues,
    query
  });

  const applyFilters = () => {
    assessments.applyFilters(filterValues);
    setDrawerOpen(false);
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.ASSESSMENT_REGISTRY_SEARCH_RESULTS')}
        callToAction={[
          {
            variant: 'outlined',
            buttonText: t('assessmentsRegistrySearchResults.uploadFlow'),
            onActionClick: () => navigate(PageRoutes.ASSESSMENT_REGISTRY_CREATE)
          }
        ]}
      />

      <Grid container justifyContent="flex-end" p={2}>
        <ButtonNaked
          data-testid="open-drawer"
          color="primary"
          size="medium"
          startIcon={<FilterAlt />}
          onClick={toggleDrawer}
        >
          {`${t('commons.filters.filtersField')} (${selectedFilters.length})`}
        </ButtonNaked>
      </Grid>

      <Grid
        container
        p={2}
        sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }}
      >
        <SearchResultsDataGrid data={assessments.query.data} />
      </Grid>

      <FilterDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        title={t('commons.filters.filtersField')}
        filterMap={filterMap}
        buttons={[
          {
            buttonText: t('commons.filters.filterResults'),
            onButtonClick: applyFilters,
            variant: 'contained',
            id: 'multifilter-drawer-search-btn'
          },
          {
            buttonText: t('commons.filters.remove'),
            onButtonClick: removeAllFilters,
            variant: 'text',
            id: 'multifilter-drawer-remove-btn'
          }
        ]}
      />
    </>
  );
};
