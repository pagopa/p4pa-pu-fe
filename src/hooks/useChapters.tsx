import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/GlobalStore';
import { initialFilterValues } from '../store/FilterStore';
import utils from '../utils';
import { AxiosError } from 'axios';

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

type PagedAssessmentRegistryResponse = {
  content?: Array<AssessmentRegistryItem>;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  number?: number;
};

export type ChapterOption = {
  label: string;
  value: string;
  assessmentRegistryId?: number;
};

export type ChaptersPurpose = 'validation' | 'selection';

export type UseChaptersParams = {
  operatingYear?: string;
  debtPositionTypeOrgCode?: string;
  enabled?: boolean;
  purpose?: ChaptersPurpose;
};

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

  useEffect(() => {
    if (isSuccess && data?.content) {
      try {
        const chaptersMap = data.content
          .filter(
            (chapter: AssessmentRegistryItem) => chapter && chapter.sectionCode
          )
          .sort((a: AssessmentRegistryItem, b: AssessmentRegistryItem) =>
            (a.sectionCode || '').localeCompare(b.sectionCode || '')
          )
          .map((chapter: AssessmentRegistryItem) => {
            const parts: Array<string> = [];
            if (chapter.officeDescription) {
              parts.push(chapter.officeDescription);
            }
            const sectionDesc =
              chapter.sectionDescription || chapter.sectionCode;
            if (sectionDesc) {
              parts.push(sectionDesc);
            }
            if (chapter.assessmentDescription) {
              parts.push(chapter.assessmentDescription);
            }
            const label =
              parts.length > 0 ? parts.join(' - ') : chapter.sectionCode || '-';
            return {
              label,
              value: chapter.sectionCode || '',
              assessmentRegistryId: chapter.assessmentRegistryId
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
      if (!isServerError && purpose === 'validation') {
        utils.notify.emit(t('errors.fetchChapters'), 'error');
      }
      setChapters([]);
    }
  }, [data, isError, isSuccess, t, chaptersQuery.error, purpose]);

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
    hasNoResults: isSuccess && (!data?.content || data.content.length === 0),
    getAssessmentRegistryId: (chapterCode: string): number | undefined => {
      return chapters.find((chapter) => chapter.value === chapterCode)
        ?.assessmentRegistryId;
    }
  };
};
