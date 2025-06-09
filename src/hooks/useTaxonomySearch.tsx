import { useState, useCallback, useEffect } from 'react';
import { usePaginationState } from './usePaginationState';
import { getTaxonomies, TaxonomiesQuery } from '../api/taxonomy';
import { TaxonomyFilters } from '../models/Taxonomy';

export type UseTaxonomySearchProps = {
  filterValues: TaxonomyFilters;
  initialPage?: number;
  initialSize?: number;
};

export const useTaxonomySearch = ({
  filterValues,
  initialPage,
  initialSize
}: UseTaxonomySearchProps) => {
  const [sort, setSort] = useState<Array<string>>([]);
  const { paginationParams, handlePaginationChange, setPaginationParams } =
    usePaginationState({
      initialPage,
      initialSize
    });

  const query = getTaxonomies();

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [paginationParams.page, paginationParams.size, sort]);

  const filterToRequest = (): TaxonomiesQuery => ({
    ...(filterValues?.orgType && {
      organizationType: filterValues.orgType
    }),
    ...(filterValues?.macroAreaCode && {
      macroAreaCode: filterValues.macroAreaCode
    }),
    ...(filterValues?.serviceTypeCode && {
      serviceTypeCode: filterValues.serviceTypeCode
    }),
    ...(filterValues?.collectingReason && {
      collectionReason: filterValues.collectingReason
    }),
    ...(sort.length && { sort }),
    page: paginationParams.page,
    size: paginationParams.size
  });

  const applyFilters = useCallback(() => {
    query.mutate(filterToRequest());
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  }, [filterToRequest, query]);

  return {
    applyFilters,
    query,
    filterValues,
    handlePaginationChange,
    paginationParams,
    setSort
  };
};

export default useTaxonomySearch;
