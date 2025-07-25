import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import utils from '../utils';
import { getOperatingYears } from '../api/assessments';
import { AxiosError } from 'axios';

export type OperatingYearOption = {
  label: string;
  value: string;
};

/**
 * Transform the operating years data into options for the select
 * @param data - Array of operating years as strings
 * @param includeAllOption - Whether to include the "All" option
 * @param allOptionLabel - Label for the "All" option
 * @returns Array di opzioni trasformate
 */
export const transformOperatingYearsData = (
  data: string[] | undefined,
  includeAllOption: boolean,
  allOptionLabel: string
): OperatingYearOption[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  try {
    const yearOptions = data
      .filter((year: string) => year && year.trim() !== '')
      .sort((a, b) => b.localeCompare(a))
      .map((year: string) => ({
        label: year,
        value: year
      }));

    if (includeAllOption) {
      return [
        {
          label: allOptionLabel,
          value: 'ALL'
        },
        ...yearOptions
      ];
    }

    return yearOptions;
  } catch (error) {
    console.error(
      'Error during the transformation of the operating years data:',
      error
    );
    return [];
  }
};

/**
 * Handles the error of the operating years query
 * @param error - Error of the query
 * @param t - Translation function
 */
export const handleOperatingYearsError = (
  error: unknown,
  t: (key: string) => string
): void => {
  const axiosError = error as AxiosError;
  const isServerError =
    axiosError?.response?.status && axiosError.response.status >= 500;

  if (!isServerError) {
    utils.notify.emit(t('errors.fetchOperatingYears'), 'error');
  }
};

/**
 * Custom hook to retrieve and transform the operating years
 * in a format compatible with the select
 *
 * @param includeAllOption - Whether to include the "All" option (default: false)
 * @param enabled - Se abilitare la query (default: true)
 * @returns Hook con la proprietà optionsMap e tutte le proprietà della query
 */
export const useOperatingYears = ({
  includeAllOption = false,
  enabled = true
}: {
  includeAllOption?: boolean;
  enabled?: boolean;
} = {}) => {
  const { t } = useTranslation();
  const operatingYearsQuery = getOperatingYears({ enabled });

  const { data, isError, error } = operatingYearsQuery;

  const optionsMap = useMemo(() => {
    return transformOperatingYearsData(
      data,
      includeAllOption,
      t('commons.all')
    );
  }, [data, includeAllOption, t]);

  useMemo(() => {
    if (isError && error) {
      handleOperatingYearsError(error, t);
    }
  }, [isError, error, t]);

  return {
    optionsMap,
    ...operatingYearsQuery
  };
};
