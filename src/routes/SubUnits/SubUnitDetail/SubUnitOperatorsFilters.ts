import { COMPONENT_TYPE } from '@core/components/FilterContainer/FilterContainer';
import { t } from 'i18next';

export const SubUnitOperatorsFilters = [
  {
    type: COMPONENT_TYPE.textField,
    label: `${t('commons.searchFor')} ${t('commons.id')}`,
    gridWidth: 3,
    id: 'mappedExternalUserId'
  },
  {
    type: COMPONENT_TYPE.textField,
    label: `${t('commons.searchFor')} ${t('commons.firstName')}`,
    gridWidth: 2,
    id: 'firstName'
  },
  {
    type: COMPONENT_TYPE.textField,
    label: `${t('commons.searchFor')} ${t('commons.lastName')}`,
    gridWidth: 3,
    id: 'lastName'
  },
  {
    type: COMPONENT_TYPE.textField,
    label: `${t('commons.searchFor')} ${t('commons.fiscalCode')}`,
    gridWidth: 3,
    id: 'fiscalCode'
  },
  {
    type: COMPONENT_TYPE.button,
    label: t('commons.filters.filterResults'),
    gridWidth: 1,
    id: 'applyFilters'
  }
];
