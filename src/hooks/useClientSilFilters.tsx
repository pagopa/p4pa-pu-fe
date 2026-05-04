import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';

/**
 * Hook for the configuration of the filters of the Client SIL page
 */
export const useClientSilFilters = () => {
  const { t } = useTranslation();

  const getFilterItems = (): Array<FilterItem> => [
    {
      type: COMPONENT_TYPE.textField,
      label: t('clientSil.filters.clientName'),
      placeholder: t('clientSil.filters.clientNamePlaceholder'),
      adornment: <SearchIcon />,
      gridWidth: 5,
      id: 'clientName'
    },
    {
      type: COMPONENT_TYPE.textField,
      label: t('clientSil.filters.clientId'),
      placeholder: t('clientSil.filters.clientIdPlaceholder'),
      adornment: <SearchIcon />,
      gridWidth: 5,
      id: 'clientId'
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 2,
      id: 'applyFilters'
    }
  ];

  return { filters: getFilterItems() };
};

export default useClientSilFilters;
