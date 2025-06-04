import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';
import { useStore } from '../store/GlobalStore';
import { useDebtPositionsTypeOrg } from './useDebtPositionsTypeOrg';
import { TelematicReceiptFilters } from './useTelematicReceiptsSearch';
import { FilterFieldIds } from '../models/SearchCardFields';

type UseTelematicReceiptsProps = {
  onFilter: (filters: TelematicReceiptFilters) => void;
  layout?: 'inline' | 'grid';
};

export const useTelematicReceiptsFilters = ({
  onFilter,
  layout = 'inline'
}: UseTelematicReceiptsProps) => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();

  const debtPositionsTypes = useDebtPositionsTypeOrg({ organizationId });

  const getFilterItems = (): Array<FilterItem> => {
    const items: Array<FilterItem> = [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchIUV'),
        adornment: <SearchIcon />,
        gridWidth: 3,
        id: FilterFieldIds.IUV_CODE,
        ...(layout === 'grid' ? { gridWidth: 12 } : {})
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        gridWidth: 3,
        options: debtPositionsTypes.optionsMap,
        id: FilterFieldIds.TYPE_ORG,
        defaultValue: 0,
        ...(layout === 'grid' ? { gridWidth: 12 } : {})
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 5,
        from: { label: t('commons.outcomeFrom') },
        to: { label: t('commons.to') },
        id: FilterFieldIds.DATE_RANGE,
        ...(layout === 'grid' ? { gridWidth: 12 } : {})
      }
    ];

    if (layout === 'inline') {
      items.push({
        type: COMPONENT_TYPE.button,
        label: t('commons.filters.filterResults'),
        gridWidth: 1,
        id: 'applyFilters',
        onClick: onFilter
      });
    }

    return items;
  };

  return { filters: getFilterItems() };
};

export default useTelematicReceiptsFilters;
