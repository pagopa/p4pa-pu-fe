import { useState } from 'react';
import FilterContainer from '../../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import CustomDataGrid, {
  DataGridContainer,
  EmptyData
} from '../../../components/DataGrid/CustomDataGrid';

import {
  getEventsColumns,
  getFiltersWithSubmitButton,
  NodoFilterValues,
  RegistryType,
  SilFilterValues
} from '../configs';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import getPagoPaRegistries from '../../../api/getPagoPaRegistries';
import getSilRegistries from '../../../api/getSilRegistries';
import { PageRoutes } from '../..';
import { GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import { ErrorMessage } from '../../../components/ErrorMessage/ErrorMessage';
import utils from '../../../utils';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../../utils/filtersValidation';
import { useSearch } from '../../../hooks/useSearch';
import {
  PagedPagoPaRegistry,
  PagedSilRegistry
} from '../../../../generated/core/data-contracts';
import { BaseFilterValues } from '../../../models/Filters';

type EventsFilters = SilFilterValues | NodoFilterValues;

export const EventList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { registryType } = useParams<{
    registryType: RegistryType;
  }>();

  const initialFilters: EventsFilters = utils.URI.decode(window.location.hash);
  const [filters, setFilters] = useState<EventsFilters>(initialFilters);
  const [error, setError] = useState(false);

  const {
    state: { organizationId }
  } = useStore();

  const query =
    registryType === 'sil'
      ? getSilRegistries(organizationId)
      : getPagoPaRegistries(organizationId);

  const {
    applyFilters,
    query: { data, isPending }
  } = useSearch<BaseFilterValues, PagedSilRegistry | PagedPagoPaRegistry>({
    query,
    filters
  });

  const onSubmit = () => {
    if (noFilterSetted(filters)) {
      setError(shouldShowGeneralError(filters));
    } else {
      setError(false);
      applyFilters(filters);
    }
  };

  const items = getFiltersWithSubmitButton(registryType || 'pagopa');

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

  const accessibleTitle =
    registryType === 'sil'
      ? t('events.list.accessibleTitleSil')
      : t('events.list.accessibleTitlePagoPa');

  return (
    <>
      <TitleComponent
        title={t('events.list.title')}
        accessibleTitle={accessibleTitle}
      />
      <Stack gap={3}>
        {error && <ErrorMessage variant="outlined" />}
        <FilterContainer
          items={items}
          values={filters}
          onChange={(field, value) =>
            setFilters({ ...filters, [field]: value })
          }
          onSubmit={onSubmit}
        />
        {data?.content?.length || isPending ? (
          <DataGridContainer>
            <CustomDataGrid<GridValidRowModel>
              sx={{ mt: 4 }}
              columns={columns}
              rows={data?.content ?? []}
              disableColumnMenu
              disableColumnResize
              getRowId={(row) => row.registryId}
              totalPages={data?.totalPages || 1}
            />
          </DataGridContainer>
        ) : (
          <EmptyData
            title={t('events.list.noResults.title')}
            description={t('events.list.noResults.description')}
          />
        )}
      </Stack>
    </>
  );
};
