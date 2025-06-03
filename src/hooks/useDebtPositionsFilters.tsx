import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';
import { SearchType } from '../models/DebtPositions';
import { useStore } from '../store/GlobalStore';
import { useDebtPositionsTypeOrg } from './useDebtPositionsTypeOrg';
import { DebtPositionStatus } from '../../generated/data-contracts';
import { optionMapsConverter } from '../utils/formatters';
import { DebtPositionsFilters } from './useDebtPositionsSearch';

type UseDebtPositionSearchProps = {
  searchType: SearchType;
  onFilter: (filters: DebtPositionsFilters) => void;
};

export const useDebtPositionFilters = ({
  searchType,
  onFilter
}: UseDebtPositionSearchProps) => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();

  const debtPositionsTypes = useDebtPositionsTypeOrg({ organizationId });

  const debtPositionsStatus = Object.values(DebtPositionStatus);

  const getFilterItems = (): Array<FilterItem> => {
    if (searchType === SearchType.DEBT_POSITION) {
      return [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.searchCF'),
          adornment: <SearchIcon />,
          gridWidth: 2,
          id: 'fiscalCode'
        },
        {
          type: COMPONENT_TYPE.dateRange,
          label: 'dateRange',
          required: true,
          gridWidth: 5,
          from: { label: t('DebtPositions.Results.filters.from') },
          to: { label: t('dates.to') },
          id: 'dateRange'
        },

        {
          type: COMPONENT_TYPE.select,
          label: t('commons.state'),
          gridWidth: 2,
          options: optionMapsConverter(debtPositionsStatus, 'commons.status'),
          id: 'status'
        },
        {
          type: COMPONENT_TYPE.select,
          label: t('commons.duetype'),
          gridWidth: 2,
          options: debtPositionsTypes.optionsMap,
          id: 'typeOrgId',
          defaultValue: 0
        },
        {
          type: COMPONENT_TYPE.button,
          label: t('commons.filters.filterResults'),
          gridWidth: 1,
          id: 'applyFilters',
          onClick: onFilter
        }
      ];
    }

    return [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchIUV'),
        adornment: <SearchIcon />,
        gridWidth: 2,
        id: 'iuv'
      },
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchCF'),
        adornment: <SearchIcon />,
        gridWidth: 2,
        id: 'fiscalCode'
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 5,
        from: { label: t('debtPositions.expirationFrom') },
        to: { label: t('dates.to') },
        id: 'dateRange'
      },
      {
        type: COMPONENT_TYPE.select,
        label: t('commons.duetype'),
        gridWidth: 2,
        options: debtPositionsTypes.optionsMap,
        id: 'typeOrgId',
        defaultValue: 0
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

export default useDebtPositionFilters;
