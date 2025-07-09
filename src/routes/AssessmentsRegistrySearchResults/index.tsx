import { Grid, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import { ReactNode, useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import {
  FilterCategory,
  FilterMap,
  useMultiFilters
} from '../../hooks/useMultiFilters';
import { BaseFilterValues } from '../../models/Filters';
import { PagedAssessmentsRegistry } from '../../../generated/data-contracts';
import { useSearch } from '../../hooks/useSearch';
import { useStore } from '../../store/GlobalStore';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { FilterDrawer } from '../../components/Drawer/FilterDrawer';
import { SearchResultsDataGrid } from './SearchResultDataGrid';
import { getAssessmentsRegistries } from '../../api/assessments';
import { AssessmentRegistryQueryParams } from '../../api/assessments/mappings';

export type LocationState = {
  category: string;
  filters: BaseFilterValues;
  filterMap: FilterMap;
};

export const AssessmentsRegistrySearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const {
    filterMap,
    selectedFilters,
    removeAllFilters,
    noFilterIsSelected,
    filterValues
  } = useMultiFilters({ filterCategory: FilterCategory.CLASSIFICATIONS });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const {
    state: { organizationId }
  } = useStore();

  const query = getAssessmentsRegistries({ organizationId });

  const assessments = useSearch({
    initialFilters: filterValues as AssessmentRegistryQueryParams,
    query
  });

  const applyFilters = () => {
    if (noFilterIsSelected.peek()) {
      assessments.applyFilters();
      setError(false);
      setDrawerOpen(false);
    } else {
      setError(true);
    }
  };

  const errorMessage: ReactNode = (
    <Typography
      variant="body2"
      color="error"
      mt={2}
      data-testid="multifilters-error-text"
    >
      {t('commons.filters.atLeastOneFilter')}
    </Typography>
  );

  return (
    <>
      <TitleComponent
        title={t('commons.routes.ASSESSMENT_REGISTRY_SEARCH_RESULTS')}
        callToAction={[
          {
            variant: 'outlined',
            buttonText: t('assessmentsRegistrySearchResults.uploadFlow'),
            onActionClick: () =>
              navigate(
                generatePath(PageRoutes.IMPORT_FLOWS, {
                  category: 'assessments'
                })
              )
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
        aria-label="results-table"
      >
        <SearchResultsDataGrid
          data={assessments.query.data as PagedAssessmentsRegistry}
          onSortChange={assessments.setSort}
          onPaginationChange={assessments.handlePaginationChange}
        />
      </Grid>

      <FilterDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        title={t('commons.filters.filtersField')}
        filterMap={filterMap}
        render={error && errorMessage}
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
