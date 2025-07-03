import { useState } from 'react';
import {
  DefaultFilterValues,
  NodoFilterValues,
  SilFilterValues,
  deepCopy
} from './configs';
import { Outlet } from 'react-router';
import { FilterFieldValue } from '../../models/Filters';

const EventsContainer = () => {
  const [filterValues, setFilterValues] = useState<
    [SilFilterValues, NodoFilterValues]
  >([DefaultFilterValues, DefaultFilterValues]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [error, setError] = useState(false);

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

  return (
    <Outlet
      context={{
        filterValues,
        setFilterValues,
        activeTabIndex,
        setActiveTabIndex,
        handleResetFilter,
        handleFilterChange,
        handleTabChange,
        error,
        setError
      }}
    />
  );
};

export default EventsContainer;
