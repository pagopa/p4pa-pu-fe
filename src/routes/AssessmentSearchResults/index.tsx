import { Grid, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AssessmentSearchResultsDataGrid from './AssessmentSearchResultsDataGrid';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import { ReactNode, useState } from 'react';
import {
  FilterCategory,
  FilterMap,
  useMultiFilters
} from '../../hooks/useMultiFilters';
import { FilterDrawer } from '../../components/Drawer/FilterDrawer';
import { BaseFilterValues } from '../../models/Filters';
import { useAssessmentsSearch } from '../../hooks/useAssessmentsSearch';
import { PagedAssessmentsExtendedDTO } from '../../../generated/data-contracts';

export type LocationState = {
  category: string;
  filters: BaseFilterValues;
  filterMap: FilterMap;
};

/**
 * Pagina dei risultati di ricerca per gli accertamenti.
 * Mostra una tabella con i risultati trovati, breadcrumb e drawer per i filtri.
 */
const AssessmentSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  // const navigate = useNavigate(); // TODO: Sarà usato per navigazione futura
  const [error, setError] = useState(false);

  // Hook per gestire i filtri multi-selezione
  const {
    filterMap,
    selectedFilters,
    removeAllFilters,
    noFilterIsSelected,
    filterValues
  } = useMultiFilters({ filterCategory: FilterCategory.ASSESSMENT });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  // Hook per la ricerca degli accertamenti
  const assessments = useAssessmentsSearch({
    initialFilters: filterValues
  });

  /**
   * Applica i filtri selezionati e esegue la ricerca
   */
  const applyFilters = () => {
    if (noFilterIsSelected.peek()) {
      assessments.executeSearch(filterValues);
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
      <TitleComponent title={t('commons.routes.ASSESSMENT_SEARCH_RESULTS')} />

      {/* Pulsante per aprire il drawer dei filtri */}
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
        <AssessmentSearchResultsDataGrid
          data={assessments.data as PagedAssessmentsExtendedDTO}
          onSortChange={assessments.setSort}
          onPaginationChange={assessments.handlePaginationChange}
          isLoading={assessments.isLoading}
        />
      </Grid>

      {/* Drawer laterale per i filtri */}
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

export default AssessmentSearchResults;
