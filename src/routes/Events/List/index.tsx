import { useEffect, useState } from 'react';
import FilterContainer from '../../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';

import {
  getEventsColumns,
  getFiltersWithSubmitButton,
  getQueryFromFilterValues,
  RegistryType,
  testFilterValidity,
  NodoOrSilEvent,
  NodoFilterValues,
  SilFilterValues
} from '../configs';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import getPagoPaRegistries from '../../../api/getPagoPaRegistry';
import getSilRegistries from '../../../api/getSilRegistries';
import { ErrorMessage } from '../../../components/FormComponent/ErrorMessage';
import { PageRoutes } from '../..';
import { EventsContext } from '../EventsContainer';
import {
  PagoPaRegistry,
  SilRegistry
} from '../../../../generated/data-contracts';
import { GridRowId } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const EventList = () => {
  const [rows, setRows] = useState<Array<SilRegistry | PagoPaRegistry>>([]);
  const { t } = useTranslation();

  const { registryType } = useParams<{
    registryType: RegistryType;
  }>();
  const { filterValues, handleFilterChange, activeTabIndex, setError, error } =
    useOutletContext<EventsContext>();

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

  const filters = getFiltersWithSubmitButton(
    registryType || 'pagopa',
    onSubmit
  );

  const getPagoPaRegistriesMutation = getPagoPaRegistries(organizationId);

  const getSilRegistriesMutation = getSilRegistries(organizationId);

  const fetchDta = async function fetchDta() {
    try {
      const query = getQueryFromFilterValues(filterValues[activeTabIndex]);

      const result =
        activeTabIndex === 0
          ? await getSilRegistriesMutation.mutateAsync(
              query as NodoOrSilEvent<SilFilterValues>
            )
          : await getPagoPaRegistriesMutation.mutateAsync(
              query as NodoOrSilEvent<NodoFilterValues>
            );

      setRows(result?.content);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    onSubmit();
  }, []);

  const action = (id: GridRowId) => {
    if (id && registryType) {
      const to = PageRoutes.BACKOFFICE_REGISTRY_DETAIL.replace(
        ':registryType',
        registryType
      ).replace(':registryId', `${id}`);
      navigate(to);
    }
  };

  const columns = getEventsColumns(action);

  return (
    <>
      <TitleComponent title={t('events.list.title')} />
      <FilterContainer
        items={filters}
        values={filterValues[activeTabIndex]}
        onChange={handleFilterChange}
      />
      {error && ErrorMessage}
      <CustomDataGrid
        sx={{ mt: 4 }}
        columns={columns}
        rows={rows}
        getRowId={(row) => row.registryId}
      />
    </>
  );
};

export default EventList;
