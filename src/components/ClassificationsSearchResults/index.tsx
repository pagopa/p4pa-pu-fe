import { Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import {
  FilterCategory,
  FilterMap,
  useMultiFilters
} from '../../hooks/useMultiFilters';
import { FilterDrawer } from '../Drawer/FilterDrawer';
import { BaseFilterValues } from '../../models/Filters';
import { PagedTreasuredClassificationExtendedDTO } from '../../../generated/data-contracts';
import DownloadIcon from '@mui/icons-material/Download';
import { getClassifications } from '../../api/classifications';
import { useSearch } from '../../hooks/useSearch';
import { useStore } from '../../store/GlobalStore';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { useFocusAfterClose } from '../../hooks/useFocusAfterClose';
import { useDataGridTabNavigation } from '../../hooks/useDataGridTabNavigation';

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
    isValid,
    filterValues
  } = useMultiFilters({ filterCategory: FilterCategory.CLASSIFICATIONS });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { armFocus } = useFocusAfterClose({
    isOpen: drawerOpen,
    rootRef: tableContainerRef
  });

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

  useDataGridTabNavigation({
    containerRef: tableContainerRef,
    rows: classifications.query.data?.content
  });

  const applyFilters = () => {
    if (isValid) {
      setError(false);
      classifications.applyFilters(filterValues);
      armFocus();
      setDrawerOpen(false);
    } else {
      setError(true);
    }
  };

  const handleFilterInteraction = () => {
    setError(false);
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.CLASSIFICATIONS_SEARCH_RESULTS')}
        accessibleTitle={t('classificationsSearchResults.accessibleTitle')}
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
          {`${t('commons.filters.filtersField')} (${selectedFilters.length})`}
        </ButtonNaked>
      </Grid>

      <Grid
        ref={tableContainerRef}
        container
        p={2}
        sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }}
        aria-label="results-table"
        tabIndex={-1}
      >
        <SearchResultsDataGrid
          data={
            classifications.query
              .data as PagedTreasuredClassificationExtendedDTO
          }
        />
      </Grid>

      <FilterDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        title={t('commons.filters.filtersField')}
        filterMap={filterMap}
        filterCategory={FilterCategory.CLASSIFICATIONS}
        onFilterInteraction={handleFilterInteraction}
        onSubmit={applyFilters}
        render={error && <ErrorMessage variant="outlined" />}
        buttons={[
          {
            buttonText: t('commons.filters.filterResults'),
            variant: 'contained',
            id: 'multifilter-drawer-search-btn'
          },
          {
            buttonText: t('commons.filters.remove'),
            onButtonClick: () => {
              removeAllFilters();
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
