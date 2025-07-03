import { Dispatch, SetStateAction, useState } from 'react';
import {
  DefaultFilterValues,
  NodoFilterValues,
  SilFilterValues,
  deepCopy
} from './configs';
import { Outlet } from 'react-router';
import { FilterFieldValue } from '../../models/Filters';

export type EventsContext = {
  error: boolean;
  setError: Dispatch<SetStateAction<boolean>>;
  activeTabIndex: number;
  setActiveTabIndex: Dispatch<SetStateAction<number>>;
  filterValues: [SilFilterValues, NodoFilterValues];
  setFilterValues: Dispatch<
    SetStateAction<[SilFilterValues, NodoFilterValues]>
  >;
  handleTabChange: (newTabIndex: number) => void;
  handleResetFilter: () => void;
  handleFilterChange: (id: string, value: FilterFieldValue) => void;
};

const EventsContainer = () => {
  const [filterValues, setFilterValues] = useState<
    [SilFilterValues, NodoFilterValues]
  >([DefaultFilterValues, DefaultFilterValues]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
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

  const context: EventsContext = {
    filterValues,
    setFilterValues,
    activeTabIndex,
    setActiveTabIndex,
    handleResetFilter,
    handleFilterChange,
    handleTabChange,
    error,
    setError
  };
  return <Outlet context={context} />;
};

export default EventsContainer;
