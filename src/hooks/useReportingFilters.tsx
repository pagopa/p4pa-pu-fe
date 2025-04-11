import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';
import { ReportingFilters } from './useReportingSearch';

type UseReportingFiltersProps = {
  onFilter: (filters: ReportingFilters) => void;
};

export const useReportingFilters = ({ onFilter }: UseReportingFiltersProps) => {
  const { t } = useTranslation();

  const getFilterItems = (): Array<FilterItem> => {
    return [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchIUF'),
        adornment: <SearchIcon />,
        gridWidth: 3,
        id: 'iuf'
      },
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchRegulationUniqueIdentifier'),
        adornment: <SearchIcon />,
        gridWidth: 3,
        id: 'regulationUniqueIdentifier'
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 5,
        from: { label: t('commons.from') },
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

export default useReportingFilters;
