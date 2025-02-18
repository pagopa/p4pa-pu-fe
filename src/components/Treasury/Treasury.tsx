import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { FileUpload } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { PageRoutes } from '../../App';
import { generatePath, useNavigate } from 'react-router';
import { useFilters } from '../../hooks/useFilters';
import { removeAllFilters } from '../../store/FilterStore';

export const Treasury = () => {
  const { t } = useTranslation();
  const filterMap = useFilters();
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
                  text: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: removeAllFilters
                },
                {
                  text: t('commons.filters.filterResults'),
                  variant: 'contained',
                  onClick: () => console.log('filter')
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActionCard
              title={t('treasury.importflowstitle')}
              description={t('treasury.importflowsdescription')}
              actionLabel={t('treasury.importflowbutton')}
              actionIcon={<FileUpload />}
              linkLabel={t('treasury.importedflowsviewbutton')}
              onLinkClick={() => navigate(PageRoutes.TREASURY_IMPORT_OVERVIEW)}
              onActionClick={() =>
                navigate(generatePath(PageRoutes.IMPORT_FLOWS, { category: 'treasury' }))
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Treasury;
