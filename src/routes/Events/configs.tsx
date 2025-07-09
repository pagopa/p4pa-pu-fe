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
import { BaseFilterValues } from '../../models/Filters';
import { ReadMore } from '@mui/icons-material';
import i18n from '../../translations/i18n';
import { GridColDef, GridRowId } from '@mui/x-data-grid';
import { noFilterSetted } from '../../utils/filtersValidation';
import { formatDateTime } from '../../utils/formatters';

export const silFields: Array<FilterItem> = [
  {
    type: COMPONENT_TYPE.textField,
    label: i18n.t('events.searchIUVDescription'),
    adornment: <Search />,
    id: 'iuv'
  },
  {
    type: COMPONENT_TYPE.dateRange,
    label: 'dateRange',
    from: { label: i18n.t('events.searchDateFromDescription') },
    to: { label: i18n.t('events.searchDateToDescription') },
    id: 'eventDate'
  },
  {
    type: COMPONENT_TYPE.select,
    label: i18n.t('events.searchEventDescription'),
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
    label: i18n.t('events.searchIUVDescription'),
    adornment: <Search />,
    id: 'iuv'
  },
  {
    type: COMPONENT_TYPE.dateRange,
    label: 'dateRange',
    from: { label: i18n.t('events.searchDateFromDescription') },
    to: { label: i18n.t('events.searchDateToDescription') },
    id: 'eventDate'
  },
  {
    type: COMPONENT_TYPE.select,
    label: i18n.t('events.searchEventDescription'),
    options: Object.entries(RegistryPagoPaEventType).map(([key, value]) => ({
      label: key,
      value
    })),
    id: 'event'
  }
];

export const tabs: Array<TabsConfig> = [
  {
    label: i18n.t('events.tabs.sil'),
    fields: silFields
  },
  {
    label: i18n.t('events.tabs.nodo'),
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

export type NodoOrSilEvent<T extends NodoFilterValues | SilFilterValues> = {
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

export const getEventsColumns = (
  action: (rowId: GridRowId) => void
): Array<GridColDef> => [
  {
    field: 'dateTime',
    headerName: i18n.t('events.list.date'),
    valueGetter: (value) => formatDateTime(value),
    flex: 1,
    type: 'string'
  },
  {
    field: 'outcome',
    headerName: i18n.t('events.list.outcome'),
    flex: 1,
    type: 'string'
  },
  {
    field: 'iuv',
    headerName: i18n.t('events.list.iuv'),
    flex: 1,
    type: 'string'
  },
  {
    field: 'eventType',
    headerName: i18n.t('events.list.event'),
    flex: 1,
    type: 'string'
  },
  {
    field: 'action',
    headerName: '',
    flex: 0.5,
    sortable: false,
    align: 'right',
    headerAlign: 'right',
    renderCell: (row) => {
      const { id } = row;
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '100%',
            width: '100%',
            cursor: 'pointer'
          }}
        >
          <ReadMore color="primary" onClick={() => action(id)} />
        </div>
      );
    }
  }
];

export const getFiltersWithSubmitButton = (
  registryType: RegistryType,
  onSubmit: () => void
) => {
  const filtersWidth: Record<string, number> = {
    iuv: 2,
    eventDate: 5,
    event: 3,
    search: 2,
    default: 3
  };
  const fields = registryType === 'pagopa' ? nodoFields : silFields;
  const filters = [
    ...fields.map((el) => ({
      ...el,
      gridWidth: filtersWidth[el?.id || 'default']
    })),
    {
      type: COMPONENT_TYPE.button,
      label: i18n.t('commons.search'),
      id: 'search',
      gridWidth: filtersWidth['search'],
      onClick: onSubmit
    }
  ];

  return filters;
};

export type RegistryType = 'pagopa' | 'sil';

// Create a deep copy of filterValues to avoid mutating the state directly
export function deepCopy<T>(obj: T) {
  return structuredClone<T>(obj);
}

export const testFilterValidity = (
  filterValues: NodoFilterValues | SilFilterValues
) => !noFilterSetted(filterValues);
