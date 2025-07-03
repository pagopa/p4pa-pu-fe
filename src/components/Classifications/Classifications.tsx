import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import DownloadIcon from '@mui/icons-material/Download';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { FilterCategory, useMultiFilters } from '../../hooks/useMultiFilters';
import { PageRoutes } from '../../routes';
import { useNavigate } from 'react-router';
import { ReactNode, useState } from 'react';
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

  const [error, setError] = useState(false);
  const [labelError, setLabelError] = useState(false);
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

  function submitSearch() {
    const classificationType = filterValues.value.CLASSIFICATION_TYPE;
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
              render={error && errorMessage}
              extraProps={{
                showLabelError: labelError,
                onFilterInteraction: () => {
                  setLabelError(false);
                  setError(false);
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
                    setError(false);
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
