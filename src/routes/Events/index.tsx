import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import SearchCard, {
  ErrorMessage
} from '../../components/SearchCard/SearchCard';
import { useState } from 'react';
import { useStore } from '../../store/GlobalStore';
import getPagoPaRegistries from '../../api/getPagoPaRegistry';
import getSilRegistries from '../../api/getSilRegistries';
import {
  tabs,
  DefaultFilterValues,
  NodoFilterValues,
  SilFilterValues,
  getQueryFromFilterValues
} from './configs';
import { FilterFieldValue } from '../../models/Filters';
import utils from '../../utils';
import { noFilterSetted } from '../../utils/filtersValidation';

// Create a deep copy of filterValues to avoid mutating the state directly
function deepCopy<T>(obj: T) {
  return structuredClone<T>(obj);
}

const EventPage = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [error, setError] = useState(false);

  const {
    state: { organizationId }
  } = useStore();

  const [filterValues, setFilterValues] = useState<
    [SilFilterValues, NodoFilterValues]
  >([DefaultFilterValues, DefaultFilterValues]);

  const handleTabChange = (newTabIndex: number) => {
    setActiveTabIndex(newTabIndex);
    handleResetFilter();
    setError(false);
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

  const getPagoPaRegistriesMutation = getPagoPaRegistries(organizationId);

  const getSilRegistriesMutation = getSilRegistries(organizationId);

  const testFilterValidity = (
    filterValues: NodoFilterValues | SilFilterValues
  ) => !noFilterSetted(filterValues);

  const handleSubmit = async () => {
    setError(false);

    if (!testFilterValidity(filterValues[activeTabIndex])) {
      setError(true);
      return;
    }
    try {
      if (activeTabIndex === 0) {
        const query = getQueryFromFilterValues(filterValues[activeTabIndex]);
        await getSilRegistriesMutation.mutateAsync(query);
      }
      if (activeTabIndex === 1) {
        const query = getQueryFromFilterValues(filterValues[activeTabIndex]);
        await getPagoPaRegistriesMutation.mutateAsync(query);
      }
    } catch {
      console.error(error);
      utils.notify.emit(t('errors.generic'));
    }
  };

  return (
    <>
      <TitleComponent title={t('commons.routes.BACKOFFICE_EVENTS')} />
      <SearchCard
        title={t('events.searchCardTitle')}
        description={t('events.searchCardDescription')}
        tabsConfig={tabs}
        filterValues={filterValues[activeTabIndex]}
        activeTabIndex={activeTabIndex}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        render={error && ErrorMessage}
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
