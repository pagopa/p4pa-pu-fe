import { Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import { ButtonNaked } from '@pagopa/mui-italia';
import { FilterAlt } from '@mui/icons-material';
import CustomDrawer from '../Drawer/CustomDrawer';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../App';
import { useFilters } from '../../hooks/useFilters';
import { useStore } from '../../store/GlobalStore';


const TreasurySearchResults = () => {

  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const filterMap = useFilters();
  const {
    state: { filters }
  } = useStore();

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
          {`${t('commons.filters.filtersField')} (${filters.length})`}
        </ButtonNaked>
      </Grid>

      <Grid container p={2} sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }} aria-label="results-table">
        <SearchResultsDataGrid />
      </Grid>

      <CustomDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        title={t('commons.filters.filtersField')}
        multiFilterConfig={filterMap}
        buttons={[
          {buttonText: t('commons.filters.filterResults'), onButtonClick: toggleDrawer, variant: 'contained', disabled: filters[0] === '' || filters.length === 0},
          {buttonText: t('commons.filters.remove'), onButtonClick: () => console.log('filter applied'), variant: 'text'}
        ]}
      />
    </>
  );
};

export default TreasurySearchResults;
