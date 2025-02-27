import { Search } from '@mui/icons-material';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { TabsConfig } from '../SearchCard/SearchCard';
import { TFunction } from 'i18next';

export const getTabsConfig = (t: TFunction): TabsConfig[] => [
  {
    label: t('debtPositions.searchCardIUVOption'),
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: t('debtPositions.searchIUVDescription'),
        icon: <Search />
      },
      {
        type: COMPONENT_TYPE.textField,
        label: t('debtPositions.searchFiscalCodeDescription'),
        icon: <Search />
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        from: { label: t('debtPositions.expirationFrom') },
        to: { label: t('dates.to') }
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        options: [
          { label: 'Tutti', value: 'TUTTI' },
          { label: 'Tari', value: 'TARI' },
          { label: 'Dovuto', value: 'DOVUTO' }
        ]
      },
    ]
  },
  {
    label: t('debtPositions.searchCardDebtPositionOption'),
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: t('debtPositions.searchFiscalCodeDescription'),
        icon: <Search />
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        from: { label: t('debtPositions.creationFrom') },
        to: { label: t('dates.to') }
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        options: [
          { label: 'Tutti', value: 'TUTTI' },
          { label: 'Tari', value: 'TARI' },
          { label: 'Dovuto', value: 'DOVUTO' }
        ],
        gridWidth: 6
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.state'),
        options: [
          { label: 'Tutti', value: 'TUTTI' },
        ],
        gridWidth: 6
      },
    ]
  }
];