import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { FileUpload, Search } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes/routes';

export const Treasury = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <TitleComponent 
        title={t('commons.routes.TREASURY')}
        description={t('treasury.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('treasury.search')}
              description={t('treasury.searchdescription')}
              multiFilterConfig={{
                enabled: true,
                selectLabel: t('commons.searchFor'),
                inputLabel: {
                  label: t('commons.search'),
                  icon: <Search />
                },
                selectOptions: [
                  { label: 'Option 1', value: '1' },
                  { label: 'Option 2', value: '2' },
                  { label: 'Option 3', value: '3' },
                ]
              }}
              button={[
                { text: t('commons.filters.remove'), variant: 'outlined', onClick: () => console.log('remove filter') },
                { text: t('commons.filters.filterResults'), variant: 'contained', onClick: () => console.log('filter')}
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title={t('treasury.importflowstitle')}
              description={t('treasury.importflowsdescription')}
              actionLabel={t('treasury.importflowbutton')}
              actionIcon={<FileUpload/>}
              linkLabel={t('treasury.importedflowsviewbutton')}
              onActionClick={() => navigate(PageRoutes.IMPORT_FLOW_TREASURY)}
              onLinkClick={() => navigate(PageRoutes.TREASURY_IMPORT_OVERVIEW)}  
            />
          </Grid>
        </Grid>

      </Grid>
    </>
  );
};

export default Treasury;
