import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/GlobalStore';
import SearchIcon from '@mui/icons-material/Search';
import {
  DebtPositionViewQuery,
  getDebtPositionsTypes,
  getDebtPositionViews
} from '../api/debtPositions';
import { FilterFieldValue } from '../models/Filters';
import { useTranslation } from 'react-i18next';
import { COMPONENT_TYPE, FilterItem } from '../components/FilterContainer/FilterContainer';
import { SearchType } from '../models/DebtPositiosn';
import { useDataGridPagination } from './useDatagridPagination';
import { DebtPositionTypeWithCount } from '../../generated/data-contracts';

export type DebtPositionFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  status?: DebtPositionViewQuery['status'] | 'TUTTI';
  fiscalCode?: string;
};

export type UseDebtPositionFiltersProps = {
  initialFilters: DebtPositionFilters;
  searchType: SearchType;
};

export const useDebtPositionSearch = ({
  initialFilters,
  searchType
}: UseDebtPositionFiltersProps) => {
  const {
    state: { organizationId }
  } = useStore();

  const [dueTypes, setDueTypes] = useState<Array<{ label: string; value: string | number }> | []>([]);
  const { t } = useTranslation();

  const debtPositionQuery = getDebtPositionViews({ organizationId });
  const debtPositionsTypes = getDebtPositionsTypes({ organizationId });

  useEffect(() => {
    if (debtPositionsTypes.isSuccess) {
      const {
        data: {
          data: { content: debtPositionsTypesContent }
        }
      } = debtPositionsTypes;

      const dueTypesMap = debtPositionsTypesContent.map((type: DebtPositionTypeWithCount) => ({
        label: type.description,
        value: type.debtPositionTypeId
      }));

      setDueTypes(dueTypesMap);
    }
  }, [debtPositionsTypes.data]);

  const getFilterItems = (): FilterItem[] => {
    const debtPositionsFilters = [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchCF'),
        icon: <SearchIcon />,
        gridWidth: 2,
        id: 'fiscalCode'
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.state'),
        gridWidth: 2,
        options: [
          { label: 'Tutti', value: 'TUTTI' },
          { label: 'Rata', value: 'RATA' }
        ],
        id: 'status',
        defaultValue: 'TUTTI'
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        gridWidth: 2,
        options: [...dueTypes, { label: 'Tutti', value: 'TUTTI' }],
        id: 'duetype',
        defaultValue: 'TUTTI'
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 5,
        from: { label: t('DebtPositions.Results.filters.from') },
        to: { label: t('dates.to') },
        id: 'dateRange'
      }
    ];

    const iuvFilters = [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchIUV'),
        icon: <SearchIcon />,
        gridWidth: 3,
        id: 'iuv'
      },
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchCF'),
        icon: <SearchIcon />,
        gridWidth: 2,
        id: 'fiscalCode'
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 4,
        from: { label: t('DebtPositions.Results.filters.from') },
        to: { label: t('dates.to') },
        id: 'dateRange'
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        gridWidth: 2,
        options: [
          { label: 'Tutti', value: 'TUTTI' },
          { label: 'Tari', value: 'TARI' },
          { label: 'Dovuto', value: 'DOVUTO' }
        ],
        id: 'duetype',
        defaultValue: 'TUTTI'
      }
    ];

    return searchType === SearchType.DEBT_POSITION ? debtPositionsFilters : iuvFilters;
  };

  const [filterValues, setFilterValues] = useState<DebtPositionFilters>(initialFilters);

  const { pagination, handlePageChange, handlePageSizeChange } = useDataGridPagination({
    initialPage: 0,
    initialSize: 10,
    onPaginationChange: () => debtPositionQuery.mutate(filterToRequest())
  });

  const [sort, setSort] = useState<string[]>([]);

  const filterToRequest = () => ({
    creationDateFrom: filterValues?.dateRange?.from?.toISOString() ?? new Date(0).toISOString(),
    creationDateTo: filterValues?.dateRange?.to?.toISOString() ?? new Date().toISOString(),
    page: pagination.page,
    size: pagination.size,
    ...(filterValues?.fiscalCode && { fiscalCode: filterValues.fiscalCode }),
    ...(filterValues?.status &&
      filterValues?.status !== 'TUTTI' && { status: filterValues.status }),
    ...(sort.length && { sort })
  });

  useEffect(() => {
    debtPositionQuery.mutate(filterToRequest());
  }, [organizationId, pagination.page, pagination.size, sort]);

  const handleFilterChange = useCallback((id: string, value: FilterFieldValue): void => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    debtPositionQuery.mutate(filterToRequest());
  }, [filterToRequest, debtPositionQuery]);

  const filters = getFilterItems();

  const filtersWithApplyButton: FilterItem[] = [
    ...filters,
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 1,
      id: 'applyFilters',
      onClick: applyFilters
    }
  ];

  return {
    filterValues,
    setFilterValues,
    handleFilterChange,
    applyFilters,
    debtPositionsTypes,
    debtPositionQuery,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    setSort,
    filters: filtersWithApplyButton
  };
};

export default useDebtPositionSearch;
