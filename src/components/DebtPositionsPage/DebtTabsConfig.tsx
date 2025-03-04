import { Search } from '@mui/icons-material';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { TabsConfig } from '../SearchCard/SearchCard';
import { TFunction } from 'i18next';
import { FilterFieldIds } from '../../models/SearchCardFields';

export const getTabsConfig = (t: TFunction): TabsConfig[] => [
  {
    label: t('debtPositions.searchCardIUVOption'),
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: t('debtPositions.searchIUVDescription'),
        icon: <Search />,
        id: FilterFieldIds.IUV_CODE
      },
      {
        type: COMPONENT_TYPE.textField,
        label: t('debtPositions.searchFiscalCodeDescription'),
        icon: <Search />,
        id: FilterFieldIds.FISCAL_CODE
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        from: { label: t('debtPositions.expirationFrom') },
        to: { label: t('dates.to') },
        id: FilterFieldIds.DATE_RANGE
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        options: [
          { label: 'Tutti', value: 'TUTTI' },
          { label: 'Tari', value: 'TARI' },
          { label: 'Dovuto', value: 'DOVUTO' }
        ],
        id: FilterFieldIds.DUETYPE,
        defaultValue: ''
      },
    ]
  },
  {
    label: t('debtPositions.searchCardDebtPositionOption'),
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: t('debtPositions.searchFiscalCodeDescription'),
        icon: <Search />,
        id: FilterFieldIds.FISCAL_CODE
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        from: { label: t('debtPositions.creationFrom') },
        to: { label: t('dates.to') },
        id: FilterFieldIds.DATE_RANGE
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        options: [
          { label: 'Tutti', value: 'TUTTI' },
          { label: 'Tari', value: 'TARI' },
          { label: 'Dovuto', value: 'DOVUTO' }
        ],
        gridWidth: 6,
        id: FilterFieldIds.DUETYPE,
        defaultValue: ''
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.state'),
        options: [
          { label: 'Tutti', value: 'TUTTI' },
          { label: 'Rata', value: 'RATA'}
        ],
        gridWidth: 6,
        id: FilterFieldIds.STATE,
        defaultValue: ''
      },
    ]
  }
];
