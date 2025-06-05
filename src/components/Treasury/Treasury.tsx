import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { FileUpload } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { PageRoutes } from '../../routes';
import { generatePath, useNavigate } from 'react-router';
import { useMultiFilters } from '../../hooks/useMultiFilters';

export const Treasury = () => {
  const { t } = useTranslation();
  const { filterMap, removeAllFilters, noFilterIsSelected } = useMultiFilters({
    clearOnMount: true
  });
  const navigate = useNavigate();

  return (
    <>
      <TitleComponent
        title={t('commons.routes.TREASURY')}
        description={t('treasury.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <SearchCard
              title={t('treasury.search')}
              description={t('treasury.searchdescription')}
              multiFilterConfig={filterMap}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: removeAllFilters
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained',
                  disabled: !noFilterIsSelected.peek(),
                  onClick: () => navigate(PageRoutes.TREASURY_SEARCH_RESULTS)
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActionCard
              title={t('treasury.importflowstitle')}
              description={t('treasury.importflowsdescription')}
              actionLabel={t('commons.importFlow')}
              actionIcon={<FileUpload />}
              linkLabel={t('commons.showAllFlows')}
              onLinkClick={() => navigate(PageRoutes.TREASURY_IMPORT_OVERVIEW)}
              onActionClick={() =>
                navigate(
                  generatePath(PageRoutes.IMPORT_FLOWS, {
                    category: 'treasury'
                  })
                )
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Treasury;
