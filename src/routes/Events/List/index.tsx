import { useEffect, useState } from 'react';
import FilterContainer from '../../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';

import {
  columns,
  getFilters,
  getQueryFromFilterValues,
  RegistryType,
  testFilterValidity
} from '../configs';
import { useOutletContext, useParams } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import getPagoPaRegistries from '../../../api/getPagoPaRegistry';
import getSilRegistries from '../../../api/getSilRegistries';
import { ErrorMessage } from '../../../components/FormComponent/ErrorMessage';

const EventList = () => {
  const [rows, setRows] = useState([]);

  const { registryType } = useParams<{
    registryType: RegistryType;
  }>();
  const { filterValues, handleFilterChange, activeTabIndex, setError, error } =
    useOutletContext();

  const {
    state: { organizationId }
  } = useStore();

  const onSubmit = () => {
    setError(false);
    if (!testFilterValidity(filterValues[activeTabIndex])) {
      setError(true);
      return;
    }
    fetchDta();
  };

  const filters = getFilters(registryType || 'pagopa', onSubmit);

  const getPagoPaRegistriesMutation = getPagoPaRegistries(organizationId);

  const getSilRegistriesMutation = getSilRegistries(organizationId);

  const fetchDta = async function fetchDta() {
    try {
      const query = getQueryFromFilterValues(filterValues[activeTabIndex]);
      let result;
      if (activeTabIndex === 0) {
        result = await getSilRegistriesMutation.mutateAsync(query);
      }
      if (activeTabIndex === 1) {
        result = await getPagoPaRegistriesMutation.mutateAsync(query);
      }
      setRows(result);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDta();
  }, []);

  return (
    <>
      <TitleComponent title={'Risultato ricerca'} />
      <FilterContainer
        items={filters}
        values={filterValues[activeTabIndex]}
        onChange={handleFilterChange}
      />
      {error && ErrorMessage}
      <CustomDataGrid rows={rows} columns={columns} />
    </>
  );
};

export default EventList;
