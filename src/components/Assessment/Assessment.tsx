import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import AddIcon from '@mui/icons-material/Add';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useMultiFilters, FilterCategory } from '../../hooks/useMultiFilters';
import { ReactNode, useState, useMemo } from 'react';
import { useDebtPositionsTypeOrg } from '../../hooks/useDebtPositionsTypeOrg';
import { useStore } from '../../store/GlobalStore';
import { useAssessmentsSearch } from '../../hooks/useAssessmentsSearch';

export const Assessment = () => {
  const { t } = useTranslation();
  const { state } = useStore();
  const organizationId = state.organizationId;

  const { optionsMap: debtTypesOptions } = useDebtPositionsTypeOrg({
    organizationId: organizationId || 0,
    includeAllOption: true,
    useCodeAsValue: true // for assessments we use the code (string)
  });

  const { filterMap, removeAllFilters, noFilterIsSelected, filterValues } =
    useMultiFilters({
      clearOnMount: true,
      filterCategory: FilterCategory.ASSESSMENT
    });

  const assessmentSearch = useAssessmentsSearch({
    initialFilters: filterValues,
    initialPage: 0,
    initialSize: 20
  });

  // Populate the select DEBT_TYPE options dynamically
  const enhancedFilterMap = useMemo(() => {
    if (!filterMap.DEBT_TYPE) return filterMap;

    return {
      ...filterMap,
      DEBT_TYPE: {
        ...filterMap.DEBT_TYPE,
        fields: filterMap.DEBT_TYPE.fields.map((field) => ({
          ...field,
          options: debtTypesOptions
        }))
      }
    };
  }, [filterMap, debtTypesOptions]);

  const [error, setError] = useState(false);
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

  const handleCreateAssessment = () => {
    console.log('Crea accertamento clicked');
  };

  const handleCreateChapter = () => {
    console.log('Crea nuovo capitolo clicked');
  };

  const handleViewAllChapters = () => {
    console.log('Vedi tutti i capitoli clicked');
  };

  function submitSearch() {
    if (!noFilterIsSelected.peek()) {
      // If no filters are selected, show error
      setError(true);
    } else {
      setError(false);

      assessmentSearch.executeSearch(filterValues);
      console.log('assessmentSearch', assessmentSearch);

      // TODO: Navigate to the results page when it is implemented
      // navigate(PageRoutes.ASSESSMENT_SEARCH_RESULTS);
    }
  }

  return (
    <>
      <TitleComponent
        title={t('commons.routes.ASSESSMENT')}
        callToAction={[
          {
            icon: <AddIcon />,
            buttonText: t('assessment.createAssessment'),
            variant: 'contained',
            onActionClick: handleCreateAssessment
          }
        ]}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <SearchCard
              title={t('assessment.search')}
              description={t('assessment.searchDescription')}
              multiFilterConfig={enhancedFilterMap}
              render={error && errorMessage}
              extraProps={{
                onFilterInteraction: () => setError(false)
              }}
              filterCategory={FilterCategory.ASSESSMENT}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: () => {
                    removeAllFilters();
                    setError(false);
                  },
                  id: 'assessment-remove-btn'
                },
                {
                  label: t('commons.search'),
                  variant: 'contained',
                  onClick: submitSearch,
                  id: 'assessment-search-btn',
                  disabled: assessmentSearch.isLoading
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActionCard
              title={t('assessment.chapters')}
              titleIcon={<BookmarksIcon />}
              description={t('assessment.chaptersDescription')}
              actionLabel={t('assessment.createChapter')}
              actionIcon={<AddIcon />}
              linkLabel={t('assessment.seeAllChapters')}
              onLinkClick={handleViewAllChapters}
              onActionClick={handleCreateChapter}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Assessment;
