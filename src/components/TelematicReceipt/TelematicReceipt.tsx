import SearchCard, { ErrorMessage } from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { Download, Upload } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useCallback, useState } from 'react';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { noFilterSetted } from '../../utils/filtersValidation';

export const TelematicReceipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Array<BaseFilterValues>>([{}]);
  const [error, setError] = useState<boolean>(false);

  const navigateToResults = useCallback(() => {
    if (!noFilterSetted(filters[0])) {
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
              render={error && ErrorMessage}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: resetCurrentFilters,
                  id: 'telematic-receipt-reset-btn'
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained',
                  onClick: navigateToResults,
                  id: 'telematic-receipt-search-btn'
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <ActionCard
                title={t('telematicReceipts.downloadflowstitle')}
                description={t('telematicReceipts.downloadflowsdescription')}
                actionLabel={t('telematicReceipts.exportrequestbutton')}
                actionIcon={<Download />}
                linkLabel={t('telematicReceipts.exportedflowsviewbutton')}
                onActionClick={() =>
                  navigate(
                    generatePath(PageRoutes.EXPORT_FLOWS, {
                      category: 'receipt'
                    })
                  )
                }
                onLinkClick={() =>
                  navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW)
                }
              />
            </Box>

            <Box>
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
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default TelematicReceipt;
