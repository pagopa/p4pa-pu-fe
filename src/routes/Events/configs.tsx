import {
  RegistryPagoPaEventType,
  RegistrySilEventType
} from '../../../generated/data-contracts';
import { Search } from '@mui/icons-material';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../../components/FilterContainer/FilterContainer';
import { TabsConfig } from '../../components/SearchCard/SearchCard';
import i118n from '../../translations/i18n';
import { BaseFilterValues } from '../../models/Filters';

export const silFields: Array<FilterItem> = [
  {
    type: COMPONENT_TYPE.textField,
    label: i118n.t('events.searchIUVDescription'),
    adornment: <Search />,
    id: 'iuv'
  },
  {
    type: COMPONENT_TYPE.dateRange,
    label: 'dateRange',
    required: true,
    from: { label: i118n.t('events.searchDateFromDescription') },
    to: { label: i118n.t('events.searchDateToDescription') },
    id: 'eventDate'
  },
  {
    type: COMPONENT_TYPE.select,
    label: i118n.t('events.searchEventDescription'),
    options: Object.entries(RegistrySilEventType).map(([key, value]) => ({
      label: key,
      value
    })),
    id: 'event'
  }
];

export const nodoFields: Array<FilterItem> = [
  {
    type: COMPONENT_TYPE.textField,
    label: i118n.t('events.searchIUVDescription'),
    adornment: <Search />,
    id: 'iuv'
  },
  {
    type: COMPONENT_TYPE.dateRange,
    label: 'dateRange',
    required: true,
    from: { label: i118n.t('events.searchDateFromDescription') },
    to: { label: i118n.t('events.searchDateToDescription') },
    id: 'eventDate'
  },
  {
    type: COMPONENT_TYPE.select,
    label: i118n.t('events.searchEventDescription'),
    options: Object.entries(RegistryPagoPaEventType).map(([key, value]) => ({
      label: key,
      value
    })),
    id: 'event'
  }
];

export const tabs: Array<TabsConfig> = [
  {
    label: i118n.t('events.tabs.sil'),
    fields: silFields
  },
  {
    label: i118n.t('events.tabs.nodo'),
    fields: nodoFields
  }
];

export const DefaultFilterValues: BaseFilterValues = {
  iuv: undefined,
  eventDate: { from: null, to: null },
  event: undefined
};

export type NodoFilterValues = {
  iuv?: string;
  eventDate?: {
    from: Date | null;
    to: Date | null;
  };
  event?: RegistryPagoPaEventType;
} & BaseFilterValues;

export type SilFilterValues = {
  iuv?: string;
  eventDate?: {
    from?: Date;
    to?: Date;
  };
  event?: RegistrySilEventType;
} & BaseFilterValues;

type NodoOrSilEvent<T extends NodoFilterValues | SilFilterValues> = {
  iuv?: string;
  eventDateFrom?: string;
  eventDateTo?: string;
  eventType?: T extends NodoFilterValues
    ? RegistryPagoPaEventType
    : RegistrySilEventType;
};

export function getQueryFromFilterValues<
  T extends NodoFilterValues | SilFilterValues
>(activeFilterValues: T): NodoOrSilEvent<T> {
  return {
    iuv: activeFilterValues.iuv,
    eventDateFrom: activeFilterValues.eventDate?.from?.toISOString(),
    eventDateTo: activeFilterValues.eventDate?.to?.toISOString(),
    eventType: activeFilterValues.event as NodoOrSilEvent<T>['eventType']
  };
}
