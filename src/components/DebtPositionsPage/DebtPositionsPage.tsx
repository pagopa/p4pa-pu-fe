import { Grid } from '@mui/material';
import { FileUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { useState, useCallback } from 'react';
import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useTabsConfig } from './useDebtTabsConfig';
import { PageRoutes } from '../../App';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { SearchType } from '../../models/DebtPositions';
import { useDateRange } from '../../hooks/useDateRange';
import { FilterFieldIds } from '../../models/SearchCardFields';
import { DateValidationError } from '@mui/x-date-pickers';
import { endOfDay, startOfDay, subMonths } from 'date-fns';

export const DebtPositionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const debtTabsConfig = useTabsConfig();

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const {
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    setFromError,
    setToError,
    resetDates,
    isButtonDisabled
  } = useDateRange(activeTabIndex);

  const [filters, setFilters] = useState<Array<BaseFilterValues>>([
    { [FilterFieldIds.DATE_RANGE]: { from: fromDate, to: toDate } },
    { [FilterFieldIds.DATE_RANGE]: { from: fromDate, to: toDate } }
  ]);

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
    resetDates();
    const newFilters = [...filters];
    newFilters[activeTabIndex] = {
      ...newFilters[activeTabIndex],
      [FilterFieldIds.DATE_RANGE]: {
        from: startOfDay(subMonths(new Date(), 1)),
        to: endOfDay(new Date())
      }
    };
    setFilters(newFilters);
  }, [activeTabIndex, filters, resetDates]);

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue) => {
      const newFilters = [...filters];

      if (id === FilterFieldIds.DATE_RANGE) {
        const { from, to } = value as { from?: Date; to?: Date };
        const normalizedFrom = from ?? null;
        const normalizedTo = to ?? null;

        setFromDate(normalizedFrom);
        setToDate(normalizedTo);

        if (normalizedFrom && normalizedTo && normalizedFrom > normalizedTo) {
          setToError('invalidDate');
        } else {
          setToError(null);
        }

        newFilters[activeTabIndex] = {
          ...newFilters[activeTabIndex],
          [id]: { from: normalizedFrom, to: normalizedTo }
        };
      } else if (id === FilterFieldIds.DATE_RANGE + '_fromError') {
        setFromError(value as DateValidationError | null);
      } else if (id === FilterFieldIds.DATE_RANGE + '_toError') {
        setToError(value as DateValidationError | null);
      } else {
        newFilters[activeTabIndex] = {
          ...newFilters[activeTabIndex],
          [id]: value
        };
      }

      setFilters(newFilters);
    },
    [activeTabIndex, filters, setFromDate, setToDate, setFromError, setToError]
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
                  onClick: navigateToResults,
                  disabled: isButtonDisabled
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
                navigate(
                  generatePath(PageRoutes.IMPORT_FLOWS, {
                    category: 'debt-positions'
                  })
                )
              }
              onLinkClick={() =>
                navigate(PageRoutes.DEBT_POSITIONS_IMPORT_OVERVIEW)
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default DebtPositionsPage;
