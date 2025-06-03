import { Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../App';
import { FilterMap, useMultiFilters } from '../../hooks/useMultiFilters';
import { FilterDrawer } from '../Drawer/FilterDrawer';
import { BaseFilterValues } from '../../models/Filters';
import UseTreasurySearch from '../../hooks/useTreasurySearch';
import { PagedTreasuryView } from '../../../generated/data-contracts';

export type LocationState = {
  category: string;
  filters: BaseFilterValues;
  filterMap: FilterMap;
};

const TreasurySearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    filterMap,
    selectedFilters,
    removeAllFilters,
    noFilterIsSelected,
    filterValues
  } = useMultiFilters();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const treasury = UseTreasurySearch({
    initialFilters: filterValues
  });

  const applyFilters = () => {
    treasury.applyFilters(filterValues);
    setDrawerOpen(false);
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.TREASURY')}
        callToAction={[
          {
            variant: 'outlined',
            buttonText: t('treasurySearchResults.uploadFlow'),
            onActionClick: () =>
              navigate(
                generatePath(PageRoutes.IMPORT_FLOWS, { category: 'treasury' })
              )
          }
        ]}
        description={t('treasurySearchResults.description')}
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
          onSortChange={treasury.setSort}
          onPaginationChange={treasury.handlePaginationChange}
        />
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
            disabled: !noFilterIsSelected.peek()
          },
          {
            buttonText: t('commons.filters.remove'),
            onButtonClick: removeAllFilters,
            variant: 'text'
          }
        ]}
      />
    </>
  );
};

export default TreasurySearchResults;
