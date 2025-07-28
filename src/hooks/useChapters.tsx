import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/GlobalStore';
import { initialFilterValues } from '../store/FilterStore';
import utils from '../utils';
import { AxiosError } from 'axios';
import {
  transformChaptersData,
  createAssessmentRegistryIdGetter,
  type AssessmentRegistryItem,
  type ChapterOption
} from '../utils/chaptersHelpers';

type PagedAssessmentRegistryResponse = {
  content?: Array<AssessmentRegistryItem>;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  number?: number;
};

export type ChaptersPurpose = 'validation' | 'selection';

export type UseChaptersParams = {
  operatingYear?: string;
  debtPositionTypeOrgCode?: string;
  enabled?: boolean;
  purpose?: ChaptersPurpose;
};

export type { ChapterOption, AssessmentRegistryItem };

/**
 * Custom hook to retrieve and transform the chapters (assessments registries)
 * in a format compatible with the select
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

  const queryParams = useMemo(() => {
    if (!operatingYear || !debtPositionTypeOrgCode) return null;
    return {
      filters: {
        ...initialFilterValues,
        OPERATING_YEAR: operatingYear,
        DEBT_POSITION_TYPE_ORG_CODE: debtPositionTypeOrgCode
      },
      pagination: { page: 0, size: 1000 },
      sort: []
    };
  }, [operatingYear, debtPositionTypeOrgCode]);

  const baseCacheKey = useMemo(
    () => [
      'getChapters',
      organizationId,
      operatingYear,
      debtPositionTypeOrgCode
    ],
    [organizationId, operatingYear, debtPositionTypeOrgCode]
  );

  const fetchChapters =
    useCallback(async (): Promise<PagedAssessmentRegistryResponse | null> => {
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
    }, [organizationId, queryParams]);

  const chaptersQuery = useQuery({
    queryKey:
      purpose === 'validation' ? [...baseCacheKey, 'validation'] : baseCacheKey,
    queryFn: fetchChapters,
    enabled:
      enabled &&
      !!organizationId &&
      !!operatingYear &&
      !!debtPositionTypeOrgCode
  });

  const { data, isError, isSuccess, isPending, isFetching } = chaptersQuery;

  useEffect(() => {
    if (isSuccess && data?.content) {
      try {
        const transformedChapters = transformChaptersData(data.content);
        setChapters(transformedChapters);
      } catch (error) {
        console.error('Error processing chapters data:', error);
        utils.notify.emit(t('errors.fetchChapters'), 'error');
        setChapters([]);
      }
    }
  }, [data, isSuccess, t]);

  useEffect(() => {
    if (isError) {
      const error = chaptersQuery.error as AxiosError;
      const isServerError =
        error?.response?.status && error.response.status >= 500;
      if (!isServerError && purpose === 'validation') {
        utils.notify.emit(t('errors.fetchChapters'), 'error');
      }
      setChapters([]);
    }
  }, [isError, chaptersQuery.error, purpose, t]);

  // Reset when parameters change
  useEffect(() => {
    if (!enabled || !operatingYear || !debtPositionTypeOrgCode) {
      setChapters([]);
    }
  }, [enabled, operatingYear, debtPositionTypeOrgCode]);

  // Getter function memoized for performance
  const getAssessmentRegistryId = useMemo(
    () => createAssessmentRegistryIdGetter(chapters),
    [chapters]
  );

  return {
    optionsMap: chapters,
    isLoading: isPending || isFetching,
    isError,
    isSuccess,
    data,
    error: chaptersQuery.error,
    hasNoResults: isSuccess && (!data?.content || data.content.length === 0),
    getAssessmentRegistryId
  };
};
