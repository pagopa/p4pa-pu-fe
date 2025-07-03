import { useEffect, useState } from 'react';
import FilterContainer from '../../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';

import {
  getEventsColumns,
  getFilters,
  getQueryFromFilterValues,
  RegistryType,
  testFilterValidity
} from '../configs';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import getPagoPaRegistries from '../../../api/getPagoPaRegistry';
import getSilRegistries from '../../../api/getSilRegistries';
import { ErrorMessage } from '../../../components/FormComponent/ErrorMessage';
import { PageRoutes } from '../..';

const EventList = () => {
  const [rows, setRows] = useState([]);

  const { registryType } = useParams<{
    registryType: RegistryType;
  }>();
  const { filterValues, handleFilterChange, activeTabIndex, setError, error } =
    useOutletContext();

  const navigate = useNavigate();

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

      const result =
        activeTabIndex === 0
          ? await getSilRegistriesMutation.mutateAsync(query)
          : await getPagoPaRegistriesMutation.mutateAsync(query);

      setRows(result?.content);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDta();
  }, []);

  const action = (id: string) => {
    if (id && registryType) {
      const to = PageRoutes.BACKOFFICE_REGISTRY_DETAIL.replace(
        ':registryType',
        registryType
      ).replace(':registryId', id);
      console.log(to);
      navigate(to);
    }
  };

  const columns = getEventsColumns(action);

  return (
    <>
      <TitleComponent title={'Risultato ricerca'} />
      <FilterContainer
        items={filters}
        values={filterValues[activeTabIndex]}
        onChange={handleFilterChange}
      />
      {error && ErrorMessage}
      <CustomDataGrid
        columns={columns}
        rows={rows}
        getRowId={(row) => row.registryId}
      />
    </>
  );
};

export default EventList;
