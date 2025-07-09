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
import { ErrorMessage } from '../../../components/SearchCard/SearchCard';
import { PageRoutes } from '../..';
import { EventsContext } from '../EventsContainer';
import {
  PagedPagoPaRegistry,
  PagedSilRegistry
} from '../../../../generated/data-contracts';
import { GridRowId } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

const EventList = () => {
  const [data, setData] = useState<
    PagedSilRegistry | PagedPagoPaRegistry | undefined
  >();

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
    fetchDta(data?.size);
  };

  const filters = getFiltersWithSubmitButton(
    registryType || 'pagopa',
    onSubmit
  );

  const getPagoPaRegistriesMutation = getPagoPaRegistries(organizationId);

  const getSilRegistriesMutation = getSilRegistries(organizationId);

  const fetchDta = async function fetchDta(size = 10, page = 0) {
    try {
      const query = {
        ...getQueryFromFilterValues(filterValues[activeTabIndex]),
        size,
        page
      };

      const result =
        activeTabIndex === 0
          ? await getSilRegistriesMutation.mutateAsync(
              query as NodoOrSilEvent<SilFilterValues>
            )
          : await getPagoPaRegistriesMutation.mutateAsync(
              query as NodoOrSilEvent<NodoFilterValues>
            );

      setData(result);
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

  const onPageChange = (page: number) => {
    fetchDta(data?.size, page - 1);
  };

  const onPageSizeChange = (size: number) => {
    fetchDta(size, data?.number);
  };

  return (
    <>
      <TitleComponent title={t('events.list.title')} />
      <FilterContainer
        items={filters}
        values={filterValues[activeTabIndex]}
        onChange={handleFilterChange}
      />
      {error && <Box sx={{ mt: 4 }}>{ErrorMessage}</Box>}
      {data && (
        <CustomDataGrid
          customPagination={{
            sizePageOptions: [5, 10, 20],
            defaultPageOption: data.size,
            totalPages: data.totalPages,
            currentPage: data.number + 1,
            onPageSizeChange,
            onPageChange
          }}
          sx={{ mt: 4 }}
          columns={columns}
          rows={data.content}
          getRowId={(row) => row.registryId}
        />
      )}
    </>
  );
};

export default EventList;
