import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import utils from '../utils';
import { getOperatingYears } from '../api/assessments';
import { AxiosError } from 'axios';

/**
 * Type for the options of the select of the operating years
 */
export type OperatingYearOption = {
  label: string;
  value: string;
};

/**
 * Custom hook to retrieve and transform the operating years
 * in a format compatible with the select
 *
 * @param includeAllOption - Whether to include the "All" option (default: false)
 * @param enabled - Whether to enable the query (default: true)
 * @returns Hook with optionsMap and query properties
 */
export const useOperatingYears = ({
  includeAllOption = false,
  enabled = true
}: {
  includeAllOption?: boolean;
  enabled?: boolean;
} = {}) => {
  const [operatingYears, setOperatingYears] = useState<
    Array<OperatingYearOption>
  >([]);
  const { t } = useTranslation();

  const operatingYearsQuery = getOperatingYears({ enabled });

  const { data, isError, isSuccess } = operatingYearsQuery;

  useEffect(() => {
    if (isSuccess && data) {
      try {
        // Transform the array of strings into options for the select
        const yearsMap = data
          .filter((year: string) => year && year.trim() !== '')
          .sort((a, b) => b.localeCompare(a)) // Descending order (most recent years first)
          .map((year: string) => ({
            label: year,
            value: year
          }));

        setOperatingYears(
          includeAllOption
            ? [
                {
                  label: t('commons.all'),
                  value: 'ALL'
                },
                ...yearsMap
              ]
            : yearsMap
        );
      } catch (error) {
        console.error('Error processing operating years data:', error);
        utils.notify.emit(t('errors.fetchOperatingYears'), 'error');
        setOperatingYears([]);
      }
    }

    if (isError) {
      const error = operatingYearsQuery.error as AxiosError;
      const isServerError =
        error?.response?.status && error.response.status >= 500;

      if (!isServerError) {
        utils.notify.emit(t('errors.fetchOperatingYears'), 'error');
      }
    }
  }, [
    data,
    isError,
    isSuccess,
    t,
    operatingYearsQuery.error,
    includeAllOption
  ]);

  return { optionsMap: operatingYears, ...operatingYearsQuery };
};
