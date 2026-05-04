import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import DownloadIcon from '@mui/icons-material/Download';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { FilterCategory, useMultiFilters } from '../../hooks/useMultiFilters';
import { PageRoutes } from '../../routes';
import { useState } from 'react';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { useAppNavigate } from '../../hooks/useAppNavigation';

export const Classifications = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { filterValues, filterMap, removeAllFilters, isValid } =
    useMultiFilters({
      clearOnMount: true,
      filterCategory: FilterCategory.CLASSIFICATIONS
    });

  const [error, setError] = useState(false);

  function submitSearch() {
    if (isValid) {
      navigate(PageRoutes.CLASSIFICATIONS_SEARCH_RESULTS, {
        hashObject: filterValues
      });
    } else {
      setError(true);
    }
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
              onSubmit={submitSearch}
              render={
                error && <ErrorMessage testId="multifilters-error-text" />
              }
              filterCategory={FilterCategory.CLASSIFICATIONS}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: () => {
                    removeAllFilters();
                    setError(false);
                  },
                  id: 'searchcard-remove-btn'
                },
                {
                  label: t('commons.search'),
                  variant: 'contained',
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
