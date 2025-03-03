import { Grid } from '@mui/material';
import { FileUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import TitleComponent from '../TitleComponent/TitleComponent';
import { getTabsConfig } from './DebtTabsConfig';
import { PageRoutes } from '../../App';
import { SearchType } from '../../routes/DebtPositions/DebtPositionsResults';
import { activeTabIndex, resetFilters } from '../../store/SearchCardStore';

export const DebtPositionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const debtTabsConfig = getTabsConfig(t);

  const navigateToResults = () => {
    if (activeTabIndex.value === 0) {
      navigate(PageRoutes.DEBT_POSITION_SEARCH_RESULTS, { 
        state: { searchType: SearchType.IUV }
      });
    } else {
      navigate(PageRoutes.DEBT_POSITIONS_RESULTS, {
        state: { searchType: SearchType.DEBT_POSITION }
      });
    }
  };

  const resetCurrentFilters = () => {
    resetFilters(activeTabIndex.value);
  };

  return (
    <>
      <TitleComponent title={t('commons.routes.DEBT_POSITIONS')}
        callToAction={
          [
            {
              variant: 'contained', 
              buttonText: t('commons.createNew'), 
              onActionClick: () => console.log('create new')
            },
          ]
        } 
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('debtPositions.searchCardTitle')}
              description={t('debtPositions.searchCardDescription')}
              tabsConfig={debtTabsConfig}
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
              title={t('debtPositions.importDebtFlow')}
              description={t('debtPositions.importDebtFlowDescription')}
              actionLabel={t('commons.importFlow')}
              actionIcon={<FileUpload />}
              linkLabel={t('commons.showAllFlows')}
              onActionClick={
                () => navigate(generatePath(PageRoutes.IMPORT_FLOWS, { category: 'debt-positions' }))
              }
              onLinkClick={() => console.log('import flow')}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default DebtPositionsPage;
