import { Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { ButtonNaked } from '@pagopa/mui-italia';
import { Download, FilterAlt, Search } from '@mui/icons-material';
import CustomDrawer from '../Drawer/CustomDrawer';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../routes/routes';


const TreasurySearchResults = () => {

  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev);
  };

  return (
    <>
      <TitleComponent 
        title={t('commons.routes.TREASURY')}
        callToAction={[
          {
            variant: 'outlined',
            buttonText: t('treasurySearchResults.uploadFlow'),
            onActionClick: () => navigate(generatePath(PageRoutes.IMPORT_FLOWS, { category: 'treasury' })),
          }
        ]}
        description={t('treasurySearchResults.description')}
      />

      <Grid container justifyContent="flex-end" p={2}>
        <ButtonNaked
          color="primary"
          size="medium"
          startIcon={<FilterAlt />}
          onClick={toggleDrawer}
        >
          {t('commons.filters.filtersField')}
        </ButtonNaked>
      </Grid>

      <Grid container p={2} sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }} aria-label="results-table">
        <SearchResultsDataGrid />
      </Grid>

      <CustomDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        title={t('commons.filters.filtersField')}
        startIcon={<Download />}
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
      />
    </>
  );
};

export default TreasurySearchResults;
