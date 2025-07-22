import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/GlobalStore';
import { initialFilterValues } from '../store/FilterStore';
import utils from '../utils';
import { AxiosError } from 'axios';

/**
 * Assessment Registry item structure from API
 */
type AssessmentRegistryItem = {
  assessmentRegistryId?: number;
  organizationId?: number;
  sectionCode?: string;
  sectionDescription?: string;
  officeDescription?: string;
  assessmentCode?: string;
  assessmentDescription?: string;
  operatingYear?: string;
  status?: string;
  creationDate?: string;
};

/**
 * Paged response structure from API
 */
type PagedAssessmentRegistryResponse = {
  content?: Array<AssessmentRegistryItem>;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  number?: number;
};

/**
 * Type for the options of the select of the chapters
 */
export type ChapterOption = {
  label: string;
  value: string;
};

/**
 * Purpose of the chapters call for cache differentiation
 */
export type ChaptersPurpose = 'validation' | 'selection';

/**
 * Parameters for getting chapters
 */
export type UseChaptersParams = {
  operatingYear?: string;
  debtPositionTypeOrgCode?: string;
  enabled?: boolean;
  purpose?: ChaptersPurpose;
};

/**
 * Custom hook to retrieve and transform the chapters (assessments registries)
 * in a format compatible with the select
 *
 * OTTIMIZZAZIONI IMPLEMENTATE:
 * - Cache intelligente che condivide dati tra 'validation' e 'selection' quando possibile
 * - Controllo per evitare richieste ridondanti
 * - Gestione ottimizzata degli errori
 *
 * @param params - Parameters for filtering chapters
 * @returns Hook with optionsMap, query properties and loading states
 */
export const useChapters = ({
  operatingYear,
  debtPositionTypeOrgCode,
  enabled = true,
  purpose = 'selection'
}: UseChaptersParams = {}) => {
  const [chapters, setChapters] = useState<Array<ChapterOption>>([]);
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();

  // Create query parameters for API call
  const queryParams = useMemo(() => {
    if (!operatingYear || !debtPositionTypeOrgCode) return null;

    return {
      filters: {
        ...initialFilterValues, // Start with all filter values initialized
        OPERATING_YEAR: operatingYear, // Year as string
        DEBT_POSITION_TYPE_ORG_CODE: debtPositionTypeOrgCode
      },
      pagination: { page: 0, size: 1000 }, // Use size 1000 as requested
      sort: []
    };
  }, [operatingYear, debtPositionTypeOrgCode]);

  // Create a base cache key to share data between different purposes
  // when the call parameters are identical
  const baseCacheKey = useMemo(
    () => [
      'getChapters',
      organizationId,
      operatingYear,
      debtPositionTypeOrgCode
    ],
    [organizationId, operatingYear, debtPositionTypeOrgCode]
  );

  // Use useQuery with optimized cache keys
  // For 'validation' we use a specific cache key
  // For 'selection' we use the base cache key that can be shared
  const chaptersQuery = useQuery({
    queryKey:
      purpose === 'validation' ? [...baseCacheKey, 'validation'] : baseCacheKey,
    queryFn: async () => {
      if (!queryParams) return null;

      const { buildQueryParams } = await import('../api/assessments/mappings');
      const query = buildQueryParams(queryParams);

      const { data: response } =
        await utils.apiClient.bff.getAssessmentsRegistries(
          organizationId,
          query,
          {
            paramsSerializer: {
              indexes: null
            }
          }
        );

      return response as PagedAssessmentRegistryResponse;
    },
    enabled:
      enabled &&
      !!organizationId &&
      !!operatingYear &&
      !!debtPositionTypeOrgCode
  });

  const { data, isError, isSuccess, isPending, isFetching } = chaptersQuery;

  /**
   * Process API response and transform data for select options
   */
  useEffect(() => {
    if (isSuccess && data?.content) {
      try {
        // Transform the chapters data into options for the select
        // Concatenate only existing fields, use sectionCode as fallback for sectionDescription
        const chaptersMap = data.content
          .filter(
            (chapter: AssessmentRegistryItem) => chapter && chapter.sectionCode // Keep only items with at least sectionCode
          )
          .sort((a: AssessmentRegistryItem, b: AssessmentRegistryItem) =>
            (a.sectionCode || '').localeCompare(b.sectionCode || '')
          ) // Sort by chapter code
          .map((chapter: AssessmentRegistryItem) => {
            // Build the label by concatenating only existing fields
            const parts: Array<string> = [];

            // Add officeDescription if it exists
            if (chapter.officeDescription) {
              parts.push(chapter.officeDescription);
            }

            // Add sectionDescription, or fallback to sectionCode if sectionDescription is missing
            const sectionDesc =
              chapter.sectionDescription || chapter.sectionCode;
            if (sectionDesc) {
              parts.push(sectionDesc);
            }

            // Add assessmentDescription if it exists
            if (chapter.assessmentDescription) {
              parts.push(chapter.assessmentDescription);
            }

            // If no parts exist, use sectionCode as fallback
            const label =
              parts.length > 0 ? parts.join(' - ') : chapter.sectionCode || '-';

            return {
              label,
              value: chapter.sectionCode || ''
            };
          });

        setChapters(chaptersMap);
      } catch (error) {
        console.error('Error processing chapters data:', error);
        utils.notify.emit(t('errors.fetchChapters'), 'error');
        setChapters([]);
      }
    }

    if (isError) {
      const error = chaptersQuery.error as AxiosError;
      const isServerError =
        error?.response?.status && error.response.status >= 500;

      // Only for 'validation' we show the error as notification
      // For 'selection' the error will be handled by the component with banner
      if (!isServerError && purpose === 'validation') {
        utils.notify.emit(t('errors.fetchChapters'), 'error');
      }
      setChapters([]);
    }
  }, [data, isError, isSuccess, t, chaptersQuery.error, purpose]);

  /**
   * Reset chapters when parameters become invalid
   */
  useEffect(() => {
    if (!enabled || !operatingYear || !debtPositionTypeOrgCode) {
      setChapters([]);
    }
  }, [enabled, operatingYear, debtPositionTypeOrgCode]);

  return {
    optionsMap: chapters,
    isLoading: isPending || isFetching,
    isError,
    isSuccess,
    data,
    error: chaptersQuery.error,
    hasNoResults: isSuccess && (!data?.content || data.content.length === 0)
  };
};
