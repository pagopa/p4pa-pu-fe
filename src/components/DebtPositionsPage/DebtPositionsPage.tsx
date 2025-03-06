import { Grid } from '@mui/material';
import { FileUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { useState, useCallback } from 'react';
import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import TitleComponent from '../TitleComponent/TitleComponent';
import { getTabsConfig } from './DebtTabsConfig';
import { PageRoutes } from '../../App';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { SearchType } from '../../models/DebtPositiosn';

export const DebtPositionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const debtTabsConfig = getTabsConfig(t);

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [filters, setFilters] = useState<BaseFilterValues[]>([{}, {}]);

  const navigateToResults = useCallback(() => {
    if (activeTabIndex === 0) {
      navigate(PageRoutes.DEBT_POSITION_SEARCH_RESULTS, {
        state: {
          searchType: SearchType.IUV,
          filters: filters[activeTabIndex]
        }
      });
    } else {
      navigate(PageRoutes.DEBT_POSITIONS_RESULTS, {
        state: {
          searchType: SearchType.DEBT_POSITION,
          filters: filters[activeTabIndex]
        }
      });
    }
  }, [activeTabIndex, filters, navigate]);

  const resetCurrentFilters = useCallback(() => {
    const newFilters = [...filters];
    newFilters[activeTabIndex] = {};
    setFilters(newFilters);
  }, [activeTabIndex, filters]);

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue) => {
      setFilters((prevFilters) => {
        const newFilters = [...prevFilters];
        newFilters[activeTabIndex] = {
          ...newFilters[activeTabIndex],
          [id]: value
        };
        return newFilters;
      });
    },
    [activeTabIndex]
  );

  const handleTabChange = (newTabIndex: number) => {
    setActiveTabIndex(newTabIndex);
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.DEBT_POSITIONS')}
        callToAction={[
          {
            variant: 'contained',
            buttonText: t('commons.createNew'),
            onActionClick: () => console.log('create new')
          }
        ]}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('debtPositions.searchCardTitle')}
              description={t('debtPositions.searchCardDescription')}
              tabsConfig={debtTabsConfig}
              activeTabIndex={activeTabIndex}
              onTabChange={handleTabChange}
              filterValues={filters[activeTabIndex]}
              onFilterChange={handleFilterChange}
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
              onActionClick={() =>
                navigate(generatePath(PageRoutes.IMPORT_FLOWS, { category: 'debt-positions' }))
              }
              onLinkClick={() => navigate(PageRoutes.DEBT_POSITIONS_IMPORT_OVERVIEW)}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default DebtPositionsPage;
