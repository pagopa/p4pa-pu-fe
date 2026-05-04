import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import AddIcon from '@mui/icons-material/Add';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useMultiFilters, FilterCategory } from '../../hooks/useMultiFilters';
import { useState } from 'react';
import { PageRoutes } from '../../routes';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { useAppNavigate } from '../../hooks/useAppNavigation';
import { shouldShowGeneralError } from '../../utils/filtersValidation';

export const Assessment = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  const { filterValues, filterMap, removeAllFilters, isValid } =
    useMultiFilters({
      clearOnMount: true,
      filterCategory: FilterCategory.ASSESSMENT
    });

  const [error, setError] = useState(false);

  const handleCreateAssessment = () => {
    navigate(PageRoutes.ASSESSMENT_CREATION);
  };

  const handleCreateChapter = () => {
    navigate(PageRoutes.ASSESSMENT_REGISTRY_CREATE);
  };

  const handleViewAllChapters = () => {
    removeAllFilters();
    navigate(PageRoutes.ASSESSMENT_REGISTRY_SEARCH_RESULTS);
  };

  function submitSearch() {
    if (isValid) {
      setError(false);
      navigate(PageRoutes.ASSESSMENT_SEARCH_RESULTS, {
        hashObject: filterValues
      });
    } else {
      setError(shouldShowGeneralError(filterValues));
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
            onActionClick: handleCreateAssessment,
            dataTestId: 'assessment-create-button'
          }
        ]}
      />
      <Box py={2}></Box>
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <SearchCard
              title={t('assessment.search')}
              description={t('assessment.searchDescription')}
              multiFilterConfig={filterMap}
              onSubmit={submitSearch}
              render={
                error && <ErrorMessage testId="multifilters-error-text" />
              }
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
                  id: 'assessment-search-btn'
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <ActionCard
              title={t('assessment.chapters')}
              titleIcon={<BookmarksIcon />}
              description={t('assessment.chaptersDescription')}
              actionLabel={t('assessment.createChapter')}
              actionIcon={<AddIcon />}
              linkLabel={t('assessment.seeAllChapters')}
              onLinkClick={handleViewAllChapters}
              onActionClick={handleCreateChapter}
              actionDataTestId="assessment-create-chapter-button"
              linkDataTestId="assessment-view-all-chapters-button"
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Assessment;
