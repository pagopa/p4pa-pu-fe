import { Grid, Stack, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ReactNode, useEffect } from 'react';
import FilterContainer, { COMPONENT_TYPE, FilterItem } from '../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useSignal } from '@preact/signals-react';
import { BaseFilterValues, DateRangeValue, getFilterValuesBySearchType } from '../../store/SearchCardStore';
import { FilterFieldIds } from '../../models/SearchCardFields';

export enum SearchType {
  IUV = 'IUV',
  DEBT_POSITION = 'DEBT_POSITION'
}

export interface DebtResultsProps {
  searchType: SearchType;
  dataGridComponent: ReactNode;
}

export const DebtPositionResults = ({ searchType, dataGridComponent }: DebtResultsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const filterSignal = getFilterValuesBySearchType(searchType);

  const resultsFilterValues = useSignal<BaseFilterValues>({});
 
  useEffect(() => {
    const mappedValues = mapSearchToResultsFilters(filterSignal.value);
    resultsFilterValues.value = mappedValues;
  }, []);

  const mapSearchToResultsFilters = (searchValues: BaseFilterValues): BaseFilterValues => {
    const mapped: BaseFilterValues = {};
  
    if (searchValues[FilterFieldIds.DUETYPE]) {
      mapped[FilterFieldIds.DUETYPE] = searchValues[FilterFieldIds.DUETYPE];
    }

    if (searchValues[FilterFieldIds.STATE]) {
      mapped[FilterFieldIds.STATE] = searchValues[FilterFieldIds.STATE];
    }
  
    if (searchType === SearchType.IUV) {
      if (searchValues[FilterFieldIds.IUV_CODE]) {
        mapped[FilterFieldIds.SEARCH_IUV] = searchValues[FilterFieldIds.IUV_CODE];
      }
    
      if (searchValues[FilterFieldIds.FISCAL_CODE]) {
        mapped[FilterFieldIds.SEARCH_CF] = searchValues[FilterFieldIds.FISCAL_CODE];
      }
    } else {
      if (searchValues[FilterFieldIds.FISCAL_CODE]) {
        mapped[FilterFieldIds.SEARCH_CF] = searchValues[FilterFieldIds.FISCAL_CODE];
      }
    }

    const dateRangeKey = 'daterange';
    if (searchValues[dateRangeKey]) {
      mapped[FilterFieldIds.DATE_RANGE] = searchValues[dateRangeKey] as DateRangeValue;
    }
  
    return mapped;
  };

  useEffect(() => {
    const mappedValues = mapSearchToResultsFilters(filterSignal.value);
  
    resultsFilterValues.value = mappedValues;
  }, []);

  const getFilterItems = (): FilterItem[] => {
    const commonFilters = [
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        gridWidth: 2,
        options: [
          { label: 'TARI', value: 'TARI' },
          { label: 'DOVUTO', value: 'DOVUTO' }
        ],
        id: 'duetype'
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.state'),
        gridWidth: 2,
        options: [
          { label: 'TUTTI', value: 'TUTTI' },
          { label: 'Rata', value: 'RATA'}
        ],
        id: 'state'
      },
      {
        type: COMPONENT_TYPE.button,
        label: t('commons.filters.filterResults'),
        gridWidth: 1,
        onClick: () => console.log('Filter applied', resultsFilterValues.value)
      }
    ];

    if (searchType === SearchType.IUV) {
      return [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.searchIUV'),
          gridWidth: 2,
          id: 'searchIUV'
        },
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.searchCF'),
          gridWidth: 2,
          id: 'searchCF'
        },
        {
          type: COMPONENT_TYPE.dateRange,
          label: 'daterange',
          gridWidth: 3,
          from: { label: t('DebtPositions.Results.filters.from') },
          to: { label: t('dates.to') },
          id: 'daterange'
        },
        ...commonFilters
      ];
    } else {
      return [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.searchCF'),
          gridWidth: 3,
          id: 'searchCF'
        },
        {
          type: COMPONENT_TYPE.dateRange,
          label: 'daterange',
          gridWidth: 4,
          from: { label: t('DebtPositions.Results.filters.from') },
          to: { label: t('dates.to') },
          id: 'daterange'
        },
        ...commonFilters
      ];
    }
  };

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
          items={getFilterItems()} 
          valuesSignal={resultsFilterValues}
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
