import { Grid, Stack, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';
import FilterContainer, { COMPONENT_TYPE } from '../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../components/TitleComponent/TitleComponent';

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

  const getFilterItems = () => {
    const commonFilters = [
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        gridWidth: 2,
        options: [
          { label: 'TARI', value: 'TARI' },
          { label: 'DOVUTO', value: 'DOVUTO' }
        ]
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.state'),
        gridWidth: 2,
        options: [{ label: 'TUTTI', value: 'TUTTI' }]
      },
      {
        type: COMPONENT_TYPE.button,
        label: t('commons.filters.filterResults'),
        gridWidth: 1,
        onClick: () => console.log('Filter applied')
      }
    ];

    if (searchType === SearchType.IUV) {
      return [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.searchIUV'),
          gridWidth: 2
        },
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.searchCF'),
          gridWidth: 2
        },
        {
          type: COMPONENT_TYPE.dateRange,
          label: 'daterange',
          gridWidth: 3,
          from: { label: t('DebtPositions.Results.filters.from') },
          to: { label: t('dates.to') }
        },
        ...commonFilters
      ];
    } else {
      return [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.searchCF'),
          gridWidth: 3
        },
        {
          type: COMPONENT_TYPE.dateRange,
          label: 'daterange',
          gridWidth: 4,
          from: { label: t('DebtPositions.Results.filters.from') },
          to: { label: t('dates.to') }
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
        <FilterContainer items={getFilterItems()} />
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
