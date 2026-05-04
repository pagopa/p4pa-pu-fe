import { Grid } from '@mui/material';
import { FileUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { useState, useCallback } from 'react';
import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useTabsConfig } from './useDebtTabsConfig';
import { PageRoutes } from '../../routes';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { SearchType } from '../../models/DebtPositions';
import { useDateRange } from '../../hooks/useDateRange';
import { FilterFieldIds } from '../../models/SearchCardFields';
import { DateValidationError } from '@mui/x-date-pickers';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import utils from '../../utils';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';
import {
  isValidFiscalCodeOrPIVA,
  normalizeFiscalCodeOrPIVA,
  normalizeCompact
} from '../../utils/fieldValidation';
import {
  clearFieldError,
  setFieldError,
  stripErrorFields
} from '../../utils/filterErrors';

export const DebtPositionsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const debtTabsConfig = useTabsConfig();

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [showError, setShowError] = useState(false);

  const { setFromDate, setToDate, setFromError, setToError, resetDates } =
    useDateRange(activeTabIndex);

  const [filters, setFilters] = useState<Array<BaseFilterValues>>([]);

  const navigateToResults = useCallback(() => {
    if (!filters?.length || noFilterSetted(filters[activeTabIndex])) {
      setShowError(shouldShowGeneralError(filters[activeTabIndex]));
      return;
    }

    setShowError(false);

    const tabFilters = filters[activeTabIndex];

    // Normalize and validate fields
    let nextTabFilters = { ...tabFilters };

    // Normalize IUV if present
    const iuv = tabFilters[FilterFieldIds.IUV_CODE] as string | undefined;
    if (iuv && typeof iuv === 'string' && iuv.trim() !== '') {
      const normalizedIUV = normalizeCompact(iuv);
      nextTabFilters = {
        ...nextTabFilters,
        [FilterFieldIds.IUV_CODE]: normalizedIUV
      };
    }

    // Validate fiscalCode if present
    const fiscalCode = tabFilters[FilterFieldIds.FISCAL_CODE] as
      | string
      | undefined;

    if (
      fiscalCode &&
      typeof fiscalCode === 'string' &&
      fiscalCode.trim() !== ''
    ) {
      // Normalize the value (remove spaces, uppercase)
      const normalizedFiscalCode = normalizeFiscalCodeOrPIVA(fiscalCode);
      const isValid = isValidFiscalCodeOrPIVA(normalizedFiscalCode);

      if (!isValid) {
        const newFilters = [...filters];
        newFilters[activeTabIndex] = setFieldError(
          tabFilters,
          FilterFieldIds.FISCAL_CODE,
          t('commons.validation.invalidFiscalCodeOrVat')
        ) as typeof tabFilters;
        setFilters(newFilters);
        return;
      }
      // Prepare next filters with normalized value and cleared error
      nextTabFilters = {
        ...nextTabFilters,
        [FilterFieldIds.FISCAL_CODE]: normalizedFiscalCode,
        [`${FilterFieldIds.FISCAL_CODE}_error`]: ''
      };
    }

    // Persist normalized values in state
    if (iuv || fiscalCode) {
      const newFilters = [...filters];
      newFilters[activeTabIndex] = nextTabFilters;
      setFilters(newFilters);
    }

    const cleanedFilters = Object.entries(
      stripErrorFields(nextTabFilters) as BaseFilterValues
    ).reduce((acc, [key, value]) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        'from' in value &&
        'to' in value
      ) {
        const dateRange = value as { from?: Date | null; to?: Date | null };
        if (dateRange.from && dateRange.to) {
          acc[key] = value;
        }
      } else if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue) {
            acc[key] = trimmedValue;
          }
        } else {
          acc[key] = value;
        }
      }

      return acc;
    }, {} as BaseFilterValues);

    const params = utils.URI.encode(cleanedFilters);

    if (activeTabIndex === 0) {
      navigate(`${PageRoutes.DEBT_POSITION_SEARCH_RESULTS}#${params}`, {
        state: {
          searchType: SearchType.IUV
        }
      });
    } else {
      navigate(`${PageRoutes.DEBT_POSITIONS_RESULTS}#${params}`, {
        state: {
          searchType: SearchType.DEBT_POSITION
        }
      });
    }
  }, [activeTabIndex, filters, navigate, t]);

  const resetCurrentFilters = useCallback(() => {
    const newFilters = [...filters];

    newFilters[activeTabIndex] = {
      [FilterFieldIds.DATE_RANGE]: {
        from: null,
        to: null
      }
    };

    setFilters(newFilters);
    setShowError(false);

    resetDates();
  }, [activeTabIndex, filters, resetDates]);

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue) => {
      if (showError) {
        setShowError(false);
      }

      const newFilters = [...filters];

      // Clear fiscalCode error when user changes the field
      if (id === FilterFieldIds.FISCAL_CODE) {
        const currentTabFilters = newFilters[activeTabIndex] || {};
        if (currentTabFilters[`${FilterFieldIds.FISCAL_CODE}_error`]) {
          newFilters[activeTabIndex] = clearFieldError(
            currentTabFilters,
            FilterFieldIds.FISCAL_CODE
          ) as typeof currentTabFilters;
        }
      }

      if (id === FilterFieldIds.DATE_RANGE) {
        const dateRangeValue = value as {
          from?: Date | null;
          to?: Date | null;
        };
        const normalizedFrom = dateRangeValue.from ?? null;
        const normalizedTo = dateRangeValue.to ?? null;

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
        // Handle all other field changes (including fiscalCode_error)
        newFilters[activeTabIndex] = {
          ...newFilters[activeTabIndex],
          [id]: value
        };
      }

      setFilters(newFilters);
    },
    [
      activeTabIndex,
      filters,
      setFromDate,
      setToDate,
      setFromError,
      setToError,
      showError
    ]
  );

  const handleTabChange = (newTabIndex: number) => {
    setActiveTabIndex(newTabIndex);
    setShowError(false);
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.DEBT_POSITIONS')}
        callToAction={[
          {
            variant: 'contained',
            buttonText: t('commons.createNew'),
            onActionClick: () =>
              navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD)
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
              render={showError && <ErrorMessage />}
              onTabChange={handleTabChange}
              filterValues={filters[activeTabIndex]}
              onFilterChange={handleFilterChange}
              onSubmit={navigateToResults}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: resetCurrentFilters
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained'
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
