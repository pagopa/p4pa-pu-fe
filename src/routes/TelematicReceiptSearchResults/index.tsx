import { Grid, Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import { BaseFilterValues } from '../../models/Filters';
import useTelematicReceiptsFilters from '../../hooks/useTelematicReceiptsFilters';
import { PagedReceiptView } from '../../../generated/data-contracts';
import { useState } from 'react';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';
import { getReceipts } from '../../api/receipts';
import { useStore } from '../../store/GlobalStore';
import { useSearch } from '../../hooks/useSearch';
import { FieldValues } from 'react-hook-form';
import utils from '../../utils';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import {
  isValidFiscalCodeOrPIVA,
  normalizeFiscalCodeOrPIVA,
  normalizeCompact
} from '../../utils/fieldValidation';
import { FilterFieldIds } from '../../models/SearchCardFields';
import {
  clearFieldError,
  setFieldError,
  stripErrorFields
} from '../../utils/filterErrors';

export type LocationState = {
  filters: BaseFilterValues;
};

type FilterValuesWithErrors = FieldValues & {
  fiscalCode_error?: string;
};

const TelematicReceiptSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  const initialFilters: FilterValuesWithErrors = utils.URI.decode(
    window.location.hash
  );
  const [filterValues, setFilterValues] =
    useState<FilterValuesWithErrors>(initialFilters);

  const {
    state: { organizationId }
  } = useStore();

  const query = getReceipts({ organizationId });

  // Helper to exclude error fields from filters
  const getCleanFilters = (filters: FilterValuesWithErrors): FieldValues =>
    stripErrorFields(filters) as FieldValues;

  const telematicReceipt = useSearch({
    filters: getCleanFilters(filterValues),
    query
  });

  const applyFilters = () => {
    let nextValues = { ...filterValues } as FilterValuesWithErrors;

    // Normalize IUV if present
    const iuv = filterValues?.[FilterFieldIds.IUV_CODE] as string | undefined;
    if (iuv && iuv.trim() !== '') {
      nextValues = {
        ...nextValues,
        [FilterFieldIds.IUV_CODE]: normalizeCompact(iuv)
      };
      setFilterValues(nextValues);
    }

    // Validate fiscalCode when present
    const fiscalCode = filterValues?.[FilterFieldIds.FISCAL_CODE] as
      | string
      | undefined;
    if (fiscalCode && fiscalCode.trim() !== '') {
      // Normalize the value (remove spaces, uppercase)
      const normalizedFiscalCode = normalizeFiscalCodeOrPIVA(fiscalCode);
      if (!isValidFiscalCodeOrPIVA(normalizedFiscalCode)) {
        setFilterValues(
          (prev) =>
            setFieldError(
              prev,
              FilterFieldIds.FISCAL_CODE,
              t('commons.validation.invalidFiscalCodeOrVat')
            ) as FilterValuesWithErrors
        );
        return;
      }
      // Prepare next filters with normalized value and cleared error
      nextValues = {
        ...nextValues,
        [FilterFieldIds.FISCAL_CODE]: normalizedFiscalCode,
        fiscalCode_error: ''
      };
      setFilterValues(nextValues);
    }

    if (!noFilterSetted(nextValues)) {
      telematicReceipt.applyFilters(getCleanFilters(nextValues));
      setError(false);
    } else {
      setError(shouldShowGeneralError(nextValues));
    }
  };

  const { filters } = useTelematicReceiptsFilters({
    onFilter: applyFilters
  });

  return (
    <Stack>
      <TitleComponent
        title={t('commons.routes.TELEMATIC_RECEIPT_SEARCH_RESULTS')}
        accessibleTitle={t('telematicreceiptSearchResults.accessibleTitle')}
        description={t('telematicreceiptSearchResults.description')}
      />
      <Stack gap={3}>
        {error && <ErrorMessage variant="outlined" />}
        <FilterContainer
          items={filters}
          values={filterValues}
          onChange={(field, value) => {
            // Clear field-specific error when user types in fiscalCode
            if (field === FilterFieldIds.FISCAL_CODE) {
              setFilterValues(
                (prev) =>
                  clearFieldError(
                    {
                      ...prev,
                      [field]: value
                    },
                    FilterFieldIds.FISCAL_CODE
                  ) as FilterValuesWithErrors
              );
              return;
            }
            setFilterValues({ ...filterValues, [field]: value });
          }}
          onSubmit={applyFilters}
        />
        <Grid
          container
          p={2}
          height="100%"
          sx={{
            bgcolor: theme.palette.grey[200],
            overflow: 'auto'
          }}
        >
          <SearchResultsDataGrid
            data={telematicReceipt.query.data as PagedReceiptView}
          />
        </Grid>
      </Stack>
    </Stack>
  );
};

export default TelematicReceiptSearchResults;
