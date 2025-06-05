import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';
import { ReportingFilters } from './useReportingSearch';
import { FilterFieldIds } from '../models/SearchCardFields';

type UseReportingFiltersProps = {
  onFilter: (filters: ReportingFilters) => void;
  layout?: 'inline' | 'grid';
};

export const useReportingFilters = ({
  onFilter,
  layout = 'inline'
}: UseReportingFiltersProps) => {
  const { t } = useTranslation();

  const getFilterItems = (): Array<FilterItem> => {
    const items: Array<FilterItem> = [
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchIUF'),
        adornment: <SearchIcon />,
        gridWidth: 3,
        id: FilterFieldIds.IUF,
        ...(layout === 'grid' ? { gridWidth: 12 } : {})
      },
      {
        type: COMPONENT_TYPE.textField,
        label: t('commons.searchRegulationUniqueIdentifier'),
        adornment: <SearchIcon />,
        gridWidth: 3,
        id: FilterFieldIds.REGULATION_UNIQUE_IDENTIFIER,
        ...(layout === 'grid' ? { gridWidth: 12 } : {})
      },
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'dateRange',
        required: true,
        gridWidth: 5,
        from: { label: t('commons.from') },
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

export default useReportingFilters;
