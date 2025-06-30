import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import SearchCard, { TabsConfig } from '../../components/SearchCard/SearchCard';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../../components/FilterContainer/FilterContainer';
import { Search } from '@mui/icons-material';
import { RegistryPagoPaEventType } from '../../../generated/data-contracts';
import { useState } from 'react';
import { useStore } from '../../store/GlobalStore';
import {
  BaseFilterValues,
  DateRangeValue,
  FilterFieldValue
} from '../../models/Filters';
import getPagoPaRegistries from '../../api/getPagoPaRegistry';

const fields: Array<FilterItem> = [
  {
    type: COMPONENT_TYPE.textField,
    label: 'debtPositions.searchIUVDescription',
    adornment: <Search />,
    id: 'iuv'
  },
  {
    type: COMPONENT_TYPE.dateRange,
    label: 'dateRange',
    required: true,
    from: { label: 'eventDateFrom' },
    to: { label: 'eventDateTo' },
    id: 'eventDate'
  },
  {
    type: COMPONENT_TYPE.select,
    label: 'evento',
    options: Object.entries(RegistryPagoPaEventType).map(([key, value]) => ({
      label: key,
      value
    })),
    id: 'event'
  }
];

const tabs: Array<TabsConfig> = [
  {
    label: 'events.tabs.sil',
    fields
  },
  {
    label: 'events.tabs.nodo',
    fields
  }
];

const DefaultFilterValues: BaseFilterValues = {};

// Create a deep copy of filterValues to avoid mutating the state directly
function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const EventPage = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const {
    state: { organizationId }
  } = useStore();

  const [filterValues, setFilterValues] = useState<Array<BaseFilterValues>>([
    DefaultFilterValues,
    DefaultFilterValues
  ]);

  const handleTabChange = (newTabIndex: number) => {
    setActiveTabIndex(newTabIndex);
  };

  const handleFilterChange = (id: string, value: FilterFieldValue) => {
    const newFilterValues = deepCopy(filterValues);
    newFilterValues[activeTabIndex] = {
      ...newFilterValues[activeTabIndex],
      [id]: value
    };
    setFilterValues(newFilterValues);
  };

  const handleResetFilter = () => {
    const newFilterValues = deepCopy(filterValues);
    newFilterValues[activeTabIndex] = DefaultFilterValues;
    setFilterValues(newFilterValues);
  };

  const mutation = getPagoPaRegistries(organizationId);

  const handleSubmit = async () => {
    try {
      const activeFilterValues = filterValues[activeTabIndex];
      const query = {
        iuv: `${activeFilterValues.iuv}`,
        eventDateFrom: (
          activeFilterValues.eventDate as DateRangeValue
        )?.from?.toISOString(),
        eventDateTo: (
          activeFilterValues.eventDate as DateRangeValue
        )?.to?.toISOString(),
        eventType: activeFilterValues.event as RegistryPagoPaEventType
      };
      const response = await mutation.mutateAsync(query);
      console.log('Response from API:', response);
    } catch (error) {
      console.error('Error submitting filter values:', error);
    }
  };

  return (
    <>
      <TitleComponent title={t('commons.routes.EVENTS')} />
      <SearchCard
        title={t('events.searchCardTitle')}
        description={t('events.searchCardDescription')}
        tabsConfig={tabs}
        filterValues={filterValues[activeTabIndex]}
        activeTabIndex={activeTabIndex}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        button={[
          {
            label: t('commons.filters.remove'),
            variant: 'outlined',
            onClick: handleResetFilter
          },
          {
            label: t('commons.filters.filterResults'),
            variant: 'contained',
            onClick: handleSubmit
          }
        ]}
      />
    </>
  );
};

export default EventPage;
