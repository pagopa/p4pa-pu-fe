import { Alert, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import {
  FilterCategory,
  FilterMap,
  useMultiFilters
} from '../../hooks/useMultiFilters';
import { FilterDrawer } from '../Drawer/FilterDrawer';
import { BaseFilterValues } from '../../models/Filters';
import { PagedTreasuredClassification } from '../../../generated/data-contracts';
import DownloadIcon from '@mui/icons-material/Download';
import { getClassifications } from '../../api/classifications';
import { useSearch } from '../../hooks/useSearch';
import { useStore } from '../../store/GlobalStore';

export type LocationState = {
  category: string;
  filters: BaseFilterValues;
  filterMap: FilterMap;
};

const ClassificationsSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const {
    filterMap,
    selectedFilters,
    removeAllFilters,
    noFilterSelectedExcludingClassificationType,
    filterValues
  } = useMultiFilters({ filterCategory: FilterCategory.CLASSIFICATIONS });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [labelError, setLabelError] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const {
    state: { organizationId }
  } = useStore();
  const query = getClassifications({ organizationId });

  const classifications = useSearch({
    filters: filterValues,
    query
  });

  const applyFilters = () => {
    const classificationType = filterValues.CLASSIFICATION_TYPE;

    if (!classificationType) {
      setLabelError(true);
      return;
    }

    if (noFilterSelectedExcludingClassificationType.peek()) {
      setError(true);
      return;
    }

    setError(false);
    setLabelError(false);
    classifications.applyFilters();
    setDrawerOpen(false);
  };

  const handleFilterInteraction = () => {
    setLabelError(false);
    setError(false);
  };

  const errorMessage: ReactNode = (
    <Alert severity="error" data-testid="multifilters-error-text">
      {t('commons.filters.atLeastOneFilter')}
    </Alert>
  );

  return (
    <>
      <TitleComponent
        title={t('commons.routes.CLASSIFICATIONS_SEARCH_RESULTS')}
        callToAction={[
          {
            variant: 'outlined',
            buttonText: t('exportFlow.buttonReservationExport'),
            icon: <DownloadIcon />,
            onActionClick: () => navigate(PageRoutes.EXPORT_CLASSIFICATIONS)
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
          {`${t('commons.filters.filtersField')} (${selectedFilters.length + (filterValues.CLASSIFICATION_TYPE ? 1 : 0)})`}
        </ButtonNaked>
      </Grid>

      <Grid
        container
        p={2}
        sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }}
        aria-label="results-table"
      >
        <SearchResultsDataGrid
          data={classifications.query.data as PagedTreasuredClassification}
          onSortChange={classifications.setSort}
          onPaginationChange={classifications.handlePaginationChange}
        />
      </Grid>

      <FilterDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        title={t('commons.filters.filtersField')}
        filterMap={filterMap}
        filterCategory={FilterCategory.CLASSIFICATIONS}
        showLabelError={labelError}
        onFilterInteraction={handleFilterInteraction}
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
            onButtonClick: () => {
              removeAllFilters();
              setLabelError(false);
              setError(false);
            },
            variant: 'text',
            id: 'multifilter-drawer-remove-btn'
          }
        ]}
      />
    </>
  );
};

export default ClassificationsSearchResults;
