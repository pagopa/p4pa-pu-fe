import { useTranslation } from 'react-i18next';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';
import { OrgSubUnitStatus, SubUnitType } from '@generated/core/client';

export const useSubUnitsFilters = () => {
  const { t } = useTranslation();

  const statusSelect = Object.values(OrgSubUnitStatus).map((status) => ({
    label: t(`subunits.status.${status}`),
    value: status
  }));

  const typeSelect = Object.values(SubUnitType).map((type) => ({
    label: type,
    value: type
  }));

  const getFilterItems = (): Array<FilterItem> => [
    {
      type: COMPONENT_TYPE.textField,
      label: t('subunits.list.filters.subUnitCode'),
      gridWidth: 4,
      id: 'subUnitCode'
    },
    {
      type: COMPONENT_TYPE.select,
      label: t('subunits.list.filters.subUnitType'),
      gridWidth: 3,
      options: typeSelect,
      id: 'subUnitType'
    },
    {
      type: COMPONENT_TYPE.select,
      label: t('commons.state'),
      options: statusSelect,
      gridWidth: 3,
      id: 'status'
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
