import { Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AssessmentSearchResultsDataGrid from './AssessmentSearchResultsDataGrid';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import {
  FilterCategory,
  FilterMap,
  useMultiFilters
} from '../../hooks/useMultiFilters';
import { FilterDrawer } from '../../components/Drawer/FilterDrawer';
import { BaseFilterValues } from '../../models/Filters';
import { useAssessmentsSearch } from '../../hooks/useAssessmentsSearch';
import { PagedAssessmentsExtendedDTO } from '../../../generated/data-contracts';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';

export type LocationState = {
  category: string;
  filters: BaseFilterValues;
  filterMap: FilterMap;
};

const AssessmentSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState(false);

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

  const handleCreateAssessment = () => {
    console.log('Create assessment clicked');
  };

  const assessments = useAssessmentsSearch({
    initialFilters: filterValues
  });

  const applyFilters = () => {
    if (noFilterIsSelected.peek()) {
      assessments.executeSearch(filterValues);
      setError(false);
      setDrawerOpen(false);
    } else {
      setError(true);
    }
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.ASSESSMENT_SEARCH_RESULTS')}
        callToAction={[
          {
            icon: <AddIcon />,
            buttonText: t('assessment.createAssessment'),
            variant: 'contained',
            onActionClick: handleCreateAssessment,
            dataTestId: 'assessment-create-button'
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
        data-testid="assessment-results-container"
      >
        <AssessmentSearchResultsDataGrid
          data={assessments.data as PagedAssessmentsExtendedDTO}
          onSortChange={assessments.setSort}
          onPaginationChange={assessments.handlePaginationChange}
          isLoading={assessments.isLoading}
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

export default AssessmentSearchResults;
