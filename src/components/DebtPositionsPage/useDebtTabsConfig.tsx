import { Search } from '@mui/icons-material';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { TabsConfig } from '../SearchCard/SearchCard';
import { FilterFieldIds } from '../../models/SearchCardFields';
import { useDebtPositionsTypeOrg } from '../../hooks/useDebtPositionsTypeOrg';
import { useStore } from '../../store/GlobalStore';
import { useTranslation } from 'react-i18next';

export const useTabsConfig = (): Array<TabsConfig> => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();

  const types = useDebtPositionsTypeOrg({ organizationId });

  return [
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
          options: types.optionsMap,
          id: FilterFieldIds.TYPE_ORG,
          defaultValue: ''
        }
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
          options: types.optionsMap,
          gridWidth: 6,
          id: FilterFieldIds.TYPE_ORG,
          defaultValue: ''
        },
        {
          type: COMPONENT_TYPE.select,
          label: t('commons.state'),
          options: [
            { label: 'Tutti', value: 'TUTTI' },
            { label: 'Rata', value: 'RATA' }
          ],
          gridWidth: 6,
          id: FilterFieldIds.STATE,
          defaultValue: ''
        }
      ]
    }
  ];
};
