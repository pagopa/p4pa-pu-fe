import SearchCard, { ErrorMessage } from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import DownloadIcon from '@mui/icons-material/Download';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { FilterCategory, useMultiFilters } from '../../hooks/useMultiFilters';
import { PageRoutes } from '../../routes';
import { useNavigate } from 'react-router';
import { useState, useMemo } from 'react';
import { filterValues } from '../../store/FilterStore';

export const Classifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    filterMap,
    removeAllFilters,
    noFilterSelectedExcludingClassificationType
  } = useMultiFilters({
    clearOnMount: true,
    filterCategory: FilterCategory.CLASSIFICATIONS
  });

  const [labelError, setLabelError] = useState(false);
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);

  const shouldShowError = useMemo(() => {
    const classificationType = filterValues.value.CLASSIFICATION_TYPE;
    const hasNoFilters = noFilterSelectedExcludingClassificationType.peek();

    return hasAttemptedSearch && (!classificationType || hasNoFilters);
  }, [
    filterValues.value,
    noFilterSelectedExcludingClassificationType,
    hasAttemptedSearch
  ]);

  function submitSearch() {
    setHasAttemptedSearch(true);

    const classificationType = filterValues.value.CLASSIFICATION_TYPE;
    if (!classificationType) {
      setLabelError(true);
      return;
    }

    if (noFilterSelectedExcludingClassificationType.peek()) {
      return;
    }

    setLabelError(false);
    navigate(PageRoutes.CLASSIFICATIONS_SEARCH_RESULTS);
  }

  return (
    <>
      <TitleComponent title={t('commons.routes.CLASSIFICATIONS')} />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <SearchCard
              title={t('classifications.search')}
              description={t('classifications.searchdescription')}
              multiFilterConfig={filterMap}
              render={shouldShowError && ErrorMessage}
              extraProps={{
                showLabelError: labelError,
                onFilterInteraction: () => {
                  setLabelError(false);
                }
              }}
              filterCategory={FilterCategory.CLASSIFICATIONS}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: () => {
                    removeAllFilters();
                    setLabelError(false);
                    setHasAttemptedSearch(false);
                  },
                  id: 'searchcard-remove-btn'
                },
                {
                  label: t('commons.search'),
                  variant: 'contained',
                  onClick: submitSearch,
                  id: 'searchcard-search-btn'
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActionCard
              title={t('classifications.exportTitle')}
              description={t('classifications.exportDescription')}
              actionLabel={t('exportFlow.buttonReservationExport')}
              actionIcon={<DownloadIcon />}
              linkLabel={t('classifications.showAllResults')}
              onLinkClick={() =>
                navigate(PageRoutes.CLASSIFICATIONS_EXPORT_OVERVIEW)
              }
              onActionClick={() => navigate(PageRoutes.EXPORT_CLASSIFICATIONS)}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Classifications;
