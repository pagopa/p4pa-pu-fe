import { Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import { useState } from 'react';
import {
  FilterCategory,
  FilterMap,
  useMultiFilters
} from '../../hooks/useMultiFilters';
import { FilterDrawer } from '../Drawer/FilterDrawer';
import { BaseFilterValues } from '../../models/Filters';
import { PagedTreasuryView } from '../../../generated/data-contracts';
import { useSearch } from '../../hooks/useSearch';
import { useStore } from '../../store/GlobalStore';
import { getTreasuries } from '../../api/treasuries';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

export type LocationState = {
  category: string;
  filters: BaseFilterValues;
  filterMap: FilterMap;
};

const TreasurySearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const {
    filterMap,
    selectedFilters,
    removeAllFilters,
    noFilterIsSelected,
    filterValues
  } = useMultiFilters({ filterCategory: FilterCategory.TREASURY });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const {
    state: { organizationId }
  } = useStore();

  const query = getTreasuries({ organizationId });

  const treasury = useSearch({
    filters: filterValues,
    query
  });

  const applyFilters = () => {
    if (noFilterIsSelected.peek()) {
      treasury.applyFilters(filterValues);
      setError(false);
      setDrawerOpen(false);
    } else {
      setError(true);
    }
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.TREASURY')}
        description={t('treasurySearchResults.description')}
        accessibleTitle={t('treasurySearchResults.accessibleTitle')}
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
          data={treasury.query.data as PagedTreasuryView}
        />
      </Grid>

      <FilterDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        title={t('commons.filters.filtersField')}
        filterMap={filterMap}
        render={
          error && (
            <ErrorMessage variant="outlined" testId="multifilters-error-text" />
          )
        }
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

export default TreasurySearchResults;
