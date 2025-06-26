import { useState, useEffect } from 'react';
import { usePaginationState } from './usePaginationState';
import { TaxonomyFilters } from '../models/Taxonomy';
import { getTaxonomies } from '../api/taxonomy';

export type UseTaxonomySearchProps = {
  filters: TaxonomyFilters;
  initialPage?: number;
  initialSize?: number;
};

export const useTaxonomySearch = ({
  filters,
  initialPage = 0,
  initialSize = 10
}: UseTaxonomySearchProps) => {
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    paginationParams: pagination,
    handlePaginationChange,
    setPaginationParams
  } = usePaginationState({
    initialPage,
    initialSize
  });

  const query = getTaxonomies();

  useEffect(() => {
    query.mutateAsync({ filters, pagination, sort });
  }, []);

  const applyFilters = () => {
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
    query.mutate({
      filters,
      pagination: { page: 0, size: pagination.size },
      sort
    });
  };

  return {
    applyFilters,
    query,
    filters,
    handlePaginationChange,
    setSort,
    paginationParams: pagination
  };
};

export default useTaxonomySearch;
