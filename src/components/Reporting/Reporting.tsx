import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { FileUpload } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { useCallback, useState } from 'react';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { noFilterSetted } from '../../utils/filtersValidation';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

export const Reporting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Array<BaseFilterValues>>([{}]);
  const [error, setError] = useState<boolean>(false);

  const navigateToResults = useCallback(() => {
    if (!noFilterSetted(filters[0])) {
      navigate(PageRoutes.REPORTING_SEARCH_RESULTS, {
        state: {
          filters: filters[0]
        }
      });
    } else {
      setError(true);
    }
  }, [0, filters, navigate]);

  const resetCurrentFilters = useCallback(() => {
    const newFilters = [...filters];
    newFilters[0] = {};
    setFilters(newFilters);
  }, [0, filters]);

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue) => {
      setFilters((prevFilters) => {
        const newFilters = [...prevFilters];
        newFilters[0] = {
          ...newFilters[0],
          [id]: value
        };
        return newFilters;
      });
    },
    [0]
  );

  return (
    <>
      <TitleComponent
        title={t('reporting.title')}
        description={t('reporting.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('reporting.searchTitleContainer')}
              description={t('reporting.searchDescriptionContainer')}
              filterContext="REPORTING"
              filterValues={filters[0]}
              onFilterChange={handleFilterChange}
              render={
                error && <ErrorMessage testId="multifilters-error-text" />
              }
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: resetCurrentFilters,
                  id: 'reporting-reset-btn'
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained',
                  onClick: navigateToResults,
                  id: 'reporting-search-btn'
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title={t('reporting.importFlowsTitleContainer')}
              description={t('reporting.importFlowsDescriptionContainer')}
              actionLabel={t('commons.importFlow')}
              actionIcon={<FileUpload />}
              linkLabel={t('commons.showAllFlows')}
              onActionClick={() =>
                navigate(
                  generatePath(PageRoutes.IMPORT_FLOWS, {
                    category: 'reporting'
                  })
                )
              }
              onLinkClick={() => navigate(PageRoutes.REPORTING_IMPORT_OVERVIEW)}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Reporting;
