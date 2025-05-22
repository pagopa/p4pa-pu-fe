import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';
import { useStore } from '../store/GlobalStore';
import { useDebtPositionsTypeOrg } from './useDebtPositionsTypeOrg';
import { TelematicReceiptFilters } from './useTelematicReceiptsSearch';

type UseTelematicReceiptsProps = {
  onFilter: (filters: TelematicReceiptFilters) => void;
};

export const useTelematicReceiptsFilters = ({
  onFilter
}: UseTelematicReceiptsProps) => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();

  const debtPositionsTypes = useDebtPositionsTypeOrg({ organizationId });

  const getFilterItems = (): Array<FilterItem> => {
    return [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchIUV'),
        adornment: <SearchIcon />,
        gridWidth: 3,
        id: 'iuv'
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        gridWidth: 3,
        options: debtPositionsTypes.optionsMap,
        id: 'typeOrgId',
        defaultValue: 0
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 5,
        from: { label: t('commons.outcomeFrom') },
        to: { label: t('commons.to') },
        id: 'dateRange'
      },
      {
        type: COMPONENT_TYPE.button,
        label: t('commons.filters.filterResults'),
        gridWidth: 1,
        id: 'applyFilters',
        onClick: onFilter
      }
    ];
  };

  return { filters: getFilterItems() };
};

export default useTelematicReceiptsFilters;
