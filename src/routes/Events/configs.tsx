import {
  RegistryOutcome,
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
import { formatDateTime } from '../../utils/formatters';
import utils from '../../utils';

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
    id: 'event',
    gridWidth: 6
  },
  {
    type: COMPONENT_TYPE.select,
    label: i18n.t('events.searchEventOutcome'),
    options: Object.entries(RegistryOutcome).map(([key, value]) => ({
      label: key,
      value
    })),
    id: 'outcome',
    gridWidth: 6
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
    id: 'event',
    gridWidth: 6
  },
  {
    type: COMPONENT_TYPE.select,
    label: i18n.t('events.searchEventOutcome'),
    options: Object.entries(RegistryOutcome).map(([key, value]) => ({
      label: key,
      value
    })),
    id: 'outcome',
    gridWidth: 6
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

export type NodoFilterValues = {
  iuv?: string;
  eventDate?: {
    from?: Date;
    to?: Date;
  };
  event?: RegistryPagoPaEventType;
  outcome?: RegistryOutcome;
} & BaseFilterValues;

export type SilFilterValues = {
  iuv?: string;
  eventDate?: {
    from?: Date;
    to?: Date;
  };
  event?: RegistrySilEventType;
  outcome?: RegistryOutcome;
} & BaseFilterValues;

export type NodoOrSilEvent<T extends NodoFilterValues | SilFilterValues> = {
  iuv?: string;
  eventDateFrom?: string;
  eventDateTo?: string;
  eventType?: T extends NodoFilterValues
    ? RegistryPagoPaEventType
    : RegistrySilEventType;
  outcome?: RegistryOutcome;
};

export function getQueryFromFilterValues<
  T extends NodoFilterValues | SilFilterValues
>(activeFilterValues: T): NodoOrSilEvent<T> {
  return {
    iuv: activeFilterValues.iuv,
    eventDateFrom: utils.formatters.date.code(
      activeFilterValues.eventDate?.from
    ),
    eventDateTo: utils.formatters.date.code(activeFilterValues.eventDate?.to),
    eventType: activeFilterValues.event as NodoOrSilEvent<T>['eventType'],
    outcome: activeFilterValues.outcome
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
    flex: 0.5,
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
    field: 'eventSubType',
    headerName: i18n.t('events.list.subEvent'),
    flex: 0.5,
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
    eventDate: 4,
    event: 2,
    outcome: 2,
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
