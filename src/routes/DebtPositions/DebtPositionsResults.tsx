import { Grid, Stack, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FilterContainer, { COMPONENT_TYPE, FilterItem } from '../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { FilterFieldIds } from '../../models/SearchCardFields';
import { TFunction } from 'i18next';

export enum SearchType {
  IUV = 'IUV',
  DEBT_POSITION = 'DEBT_POSITION'
}

interface LocationState {
  searchType: SearchType;
  filters: BaseFilterValues;
}

export interface DebtResultsProps {
  searchType: SearchType;
  dataGridComponent: ReactNode;
}

const getFilterItems = (searchType: SearchType, t: TFunction): FilterItem[] => {

  const commonFilters: FilterItem[] = [
    {
      type: COMPONENT_TYPE.select,
      label: t('commons.duetype'),
      gridWidth: 2,
      options: [
        { label: 'Tutti', value: 'TUTTI' },
        { label: 'Tari', value: 'TARI' },
        { label: 'Dovuto', value: 'DOVUTO' }
      ],
      id: FilterFieldIds.DUETYPE,
      defaultValue: 'TUTTI'
    }
  ];
  
  if (searchType === SearchType.DEBT_POSITION) {
    commonFilters.push({
      type: COMPONENT_TYPE.select,
      label: t('commons.state'),
      gridWidth: 2,
      options: [
        { label: 'Tutti', value: 'TUTTI' },
        { label: 'Rata', value: 'RATA'}
      ],
      id: FilterFieldIds.STATE,
      defaultValue: 'TUTTI'
    });
  }

  if (searchType === SearchType.IUV) {
    return [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchIUV'),
        icon: <SearchIcon />,
        gridWidth: 3,
        id: FilterFieldIds.SEARCH_IUV
      },
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchCF'),
        icon: <SearchIcon />,
        gridWidth: 2,
        id: FilterFieldIds.SEARCH_CF
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 4,
        from: { label: t('DebtPositions.Results.filters.from') },
        to: { label: t('dates.to') },
        id: FilterFieldIds.DATE_RANGE
      },
      ...commonFilters
    ];
  } 

  else {
    return [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchCF'),
        icon: <SearchIcon />,
        gridWidth: 3,
        id: FilterFieldIds.SEARCH_CF
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 4,
        from: { label: t('DebtPositions.Results.filters.from') },
        to: { label: t('dates.to') },
        id: FilterFieldIds.DATE_RANGE
      },
      ...commonFilters
    ];
  }
};

const mapSearchToResultsFilters = (
  searchValues: BaseFilterValues, 
  searchType: SearchType
): BaseFilterValues => {
  const mappedFilters: BaseFilterValues = {};

  if (FilterFieldIds.DUETYPE in searchValues) {
    mappedFilters[FilterFieldIds.DUETYPE] = searchValues[FilterFieldIds.DUETYPE];
  }

  if (FilterFieldIds.STATE in searchValues) {
    mappedFilters[FilterFieldIds.STATE] = searchValues[FilterFieldIds.STATE];
  }

  if (searchType === SearchType.IUV) {
    if (FilterFieldIds.IUV_CODE in searchValues) {
      mappedFilters[FilterFieldIds.SEARCH_IUV] = searchValues[FilterFieldIds.IUV_CODE];
    }
    
    if (FilterFieldIds.FISCAL_CODE in searchValues) {
      mappedFilters[FilterFieldIds.SEARCH_CF] = searchValues[FilterFieldIds.FISCAL_CODE];
    }
  } else {
    if (FilterFieldIds.FISCAL_CODE in searchValues) {
      mappedFilters[FilterFieldIds.SEARCH_CF] = searchValues[FilterFieldIds.FISCAL_CODE];
    }
  }

  if (FilterFieldIds.DATE_RANGE in searchValues) {
    const dateRangeFilter = searchValues[FilterFieldIds.DATE_RANGE];
    
    if (dateRangeFilter && typeof dateRangeFilter === 'object') {
      if ('from' in dateRangeFilter && 'to' in dateRangeFilter) {
        mappedFilters[FilterFieldIds.DATE_RANGE] = {
          from: dateRangeFilter.from,
          to: dateRangeFilter.to
        };
      }
    }
  }
  
  return mappedFilters;
};

export const DebtPositionResults = ({ searchType, dataGridComponent }: DebtResultsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  
  const locationState = location.state as LocationState | undefined;
  const initialFilters = locationState?.filters || {};
  
  const mappedInitialFilters = mapSearchToResultsFilters(initialFilters, searchType);
  
  const [filterValues, setFilterValues] = useState<BaseFilterValues>(mappedInitialFilters);

  useEffect(() => {
    if (locationState?.filters) {
      const mappedFilters = mapSearchToResultsFilters(locationState.filters, searchType);
      setFilterValues(mappedFilters);
    }
  }, [locationState, searchType]);

  const handleFilterChange = (id: string, value: FilterFieldValue) => {
    setFilterValues(prev => ({ ...prev, [id]: value }));
  };

  const applyFilters = () => {
    console.log('Applying filters:', filterValues);
  };

  const filterItems = getFilterItems(searchType, t);
  
  const filtersWithApplyButton: FilterItem[] = [
    ...filterItems,
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 1,
      id: 'applyFilters',
      onClick: applyFilters
    }
  ];

  return (
    <Stack gap={5}>
      <TitleComponent
        title={searchType === SearchType.IUV 
          ? t('DebtPositions.Results.titleIUV') 
          : t('DebtPositions.Results.title')}
        callToAction={[
          {
            icon: searchType === SearchType.IUV 
              ? null 
              : <Add />,
            buttonText: searchType === SearchType.IUV 
              ? t('commons.createNewOne') 
              : t('commons.createNew'),
            onActionClick: () => console.log('create button clicked')
          }
        ]}
      />
      <Stack gap={3}>
        <FilterContainer 
          items={filtersWithApplyButton}
          values={filterValues}
          onChange={handleFilterChange}
        />
        <Grid
          container
          p={2}
          height="100%"
          sx={{
            bgcolor: theme.palette.grey[200],
            overflow: 'auto'
          }}
          aria-label="results-table">
          {dataGridComponent}
        </Grid>
      </Stack>
    </Stack>
  );
};

export default DebtPositionResults;
