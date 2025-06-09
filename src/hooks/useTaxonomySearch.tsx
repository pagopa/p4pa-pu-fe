import { useState, useCallback, useEffect } from 'react';
import { FilterFieldValue } from '../models/Filters';
import { usePaginationState } from './usePaginationState';
import { getTaxonomies, TaxonomiesQuery } from '../api/taxonomy';

export type TaxonomyFilters = {
  organizationType?: string;
  macroAreaCode?: string;
  serviceTypeCode?: string;
  collectionReason?: string;
};

export type UseTaxonomySearchProps = {
  initialFilters: TaxonomyFilters;
  initialPage?: number;
  initialSize?: number;
};

export const useTaxonomySearch = ({
  initialFilters,
  initialPage,
  initialSize
}: UseTaxonomySearchProps) => {
  const [filterValues, setFilterValues] =
    useState<TaxonomyFilters>(initialFilters);
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
    ...(filterValues?.organizationType && {
      organizationType: filterValues.organizationType
    }),
    ...(filterValues?.macroAreaCode && {
      macroAreaCode: filterValues.macroAreaCode
    }),
    ...(filterValues?.serviceTypeCode && {
      serviceTypeCode: filterValues.serviceTypeCode
    }),
    ...(filterValues?.collectionReason && {
      collectionReason: filterValues.collectionReason
    }),
    ...(sort.length && { sort }),
    page: paginationParams.page,
    size: paginationParams.size
  });

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue): void => {
      setFilterValues((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    query.mutate(filterToRequest());
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  }, [filterToRequest, query]);

  return {
    applyFilters,
    query,
    filterValues,
    handleFilterChange,
    handlePaginationChange,
    paginationParams,
    setFilterValues,
    setSort
  };
};

export default useTaxonomySearch;
