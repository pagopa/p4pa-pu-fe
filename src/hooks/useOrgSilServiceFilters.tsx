import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';

type UseOrgSilServiceFiltersProps = {
  onFilter: () => void;
};

export const useOrgSilServiceFilters = ({
  onFilter
}: UseOrgSilServiceFiltersProps) => {
  const { t } = useTranslation();

  const filters: Array<FilterItem> = [
    {
      type: COMPONENT_TYPE.textField,
      label: t('orgSilService.apiName'),
      adornment: <SearchIcon />,
      gridWidth: 11,
      id: 'applicationName'
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.search'),
      gridWidth: 1,
      id: 'applyFilters',
      onClick: onFilter
    }
  ];

  return { filters };
};

export default useOrgSilServiceFilters;
