import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { Download, Upload } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import { ReactNode, useCallback, useState } from 'react';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';

export const TelematicReceipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Array<BaseFilterValues>>([{}]);
  const [error, setError] = useState<boolean>(false);
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

  const navigateToResults = useCallback(() => {
    if (filters[0] && Object.keys(filters[0]).length > 0) {
      navigate(PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS, {
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
        title={t('commons.routes.TELEMATIC_RECEIPT')}
        description={t('telematicReceipts.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('telematicReceipts.search')}
              description={t('telematicReceipts.searchdescription')}
              filterContext="TELEMATIC"
              filterValues={filters[0]}
              onFilterChange={handleFilterChange}
              render={error && errorMessage}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: resetCurrentFilters
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained',
                  onClick: navigateToResults
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title={t('telematicReceipts.downloadflowstitle')}
              description={t('telematicReceipts.downloadflowsdescription')}
              actionLabel={t('telematicReceipts.exportrequestbutton')}
              actionIcon={<Download />}
              linkLabel={t('telematicReceipts.exportedflowsviewbutton')}
              onActionClick={() =>
                navigate(
                  generatePath(PageRoutes.EXPORT_FLOWS, { category: 'receipt' })
                )
              }
              onLinkClick={() =>
                navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW)
              }
            />

            <ActionCard
              title={t('telematicReceipts.importflowstitle')}
              description={t('telematicReceipts.importflowsdescription')}
              actionLabel={t('commons.importFlow')}
              actionIcon={<Upload />}
              linkLabel={t('telematicReceipts.importedflowsviewbutton')}
              onActionClick={() =>
                navigate(
                  generatePath(PageRoutes.IMPORT_FLOWS, {
                    category: 'telematic-receipt'
                  })
                )
              }
              onLinkClick={() =>
                navigate(PageRoutes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW)
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default TelematicReceipt;
