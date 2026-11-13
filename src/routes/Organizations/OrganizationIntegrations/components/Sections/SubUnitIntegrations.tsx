import { useParams } from 'react-router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrashCanIcon from '@mui/icons-material/Delete';
import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  PdndClientView,
  PdndServiceView
} from '@generated/core/data-contracts';
import {
  useDeletePdndService,
  useDeletePdndClient,
  useGetOrgSubUnitsPdndClients,
  useGetOrgSubUnitsPdndServices
} from '@core/api/integrations';
import CustomDataGrid from '@core/components/DataGrid/CustomDataGrid';
import type { FilterItem } from '@core/components/FilterContainer/FilterContainer';
import FilterContainer, {
  COMPONENT_TYPE
} from '@core/components/FilterContainer/FilterContainer';
import { useSearch } from '@core/hooks/useSearch';
import { PdndSendServiceDialog } from '../Dialogs/ServiceDialog';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import utils from '@core/utils';
import ActionMenu from '@core/components/ActionMenu/ActionMenu';
import notify from '@core/utils/notify';

type Filters = { subUnitCode?: string };


export const SubUnitIntegrations = () => {
  const { t } = useTranslation();
  // FILTERS
  const initialFilters = utils.URI.decode(window.location.hash);
  const [values, setValues] = useState<Filters>(initialFilters);
  const filterItems: Array<FilterItem> = [
    {
      type: COMPONENT_TYPE.textField,
      label: t('organizations.integrations.searchSubUnit'),
      gridWidth: 10,
      id: 'subUnitName'
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 2,
      id: 'applyFilters'
    }
  ];

  // OTHER STUFF
  const [selected, setSelected] = useState<PdndServiceView>();
  const { organizationId: urlOrganizationId } = useParams();
  const organizationId = Number(urlOrganizationId);

  // PDND SERVICES
  const ID_PDND_SERVICES = 'se';
  const pdndServicesQuery = useGetOrgSubUnitsPdndServices(organizationId);

  const deletePdndServiceMutation = useDeletePdndService(organizationId);
  const confirmDeletePdndService = (row: PdndServiceView) => {
    utils.dialog.open({
      title: t('organizations.integrations.deleteDialog.title'),
      message: t('organizations.integrations.deleteDialog.subUnitPdndService', {
        denominazione: row.subUnitName ?? row.subUnitCode
      }),
      onConfirm: () => {
        handleDeletePdndService(row.purposeId);
        utils.dialog.close();
      }
    });
  };

  const handleDeletePdndService = async (purposeId?: string) => {
    try {
      if (!purposeId) throw new Error(t('errors.missingPurposeId'));
      await deletePdndServiceMutation.mutateAsync(purposeId);
      pdndServices.applyFilters(values);
      notify.emit(t('commons.done'), 'success');
    } catch (error: unknown) {
      notify.emit(t((error as Error)?.message ?? 'errors.generic'), 'error');
    }
  };

  const pdndServices = useSearch({
    query: pdndServicesQuery,
    filters: values,
    id: ID_PDND_SERVICES,
    filtersExcluded: ['subUnitName']
  });

  const PdndServiceColumns: Array<GridColDef<PdndServiceView>> = [
    {
      field: 'subUnitCode',
      headerName: t('organizations.integrations.subUnit'),
      flex: 1,
      sortable: false,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontFamily="monospace" component="span">
          {value}
        </Typography>
      )
    },
    {
      field: 'subUnitName',
      headerName: t('organizations.integrations.subUnitName'),
      flex: 1,
      sortable: false
    },
    {
      field: 'serviceType',
      headerName: t('organizations.integrations.serviceType'),
      flex: 1
    },
    {
      field: 'clientId',
      headerName: t('organizations.integrations.clientId'),
      flex: 1.5
    },
    {
      field: 'action',
      headerName: '',
      width: 140,
      display: 'flex',
      align: 'center',
      renderCell: ({ row }) => (
        <ActionMenu
          rowId={row.clientId}
          aria-label={t('organizations.integrations.showItem', {
            name: row.subUnitName ?? row.subUnitCode
          })}
          menuItems={[
            {
              label: t('organizations.integrations.showItem'),
              action: () => setSelected(row)
            },
            {
              icon: <TrashCanIcon />,
              label: t('organizations.integrations.deleteItem'),
              action: () => confirmDeletePdndService(row)
            },
          ]}
        />
      )
    }
  ];

  // PDND CLIENTS
  const ID_PDND_CLIENTS = 'cl';
  const pdndClientsQuery = useGetOrgSubUnitsPdndClients(organizationId);

  const deletePdndClientMutation = useDeletePdndClient(organizationId);
  const confirmDeletePdndClient = (row: PdndClientView) => {
    utils.dialog.open({
      title: t('organizations.integrations.deleteDialog.title'),
      message: t('organizations.integrations.deleteDialog.subUnitPdndClient', {
        denominazione: row.subUnitName ?? row.subUnitCode
      }),
      onConfirm: () => {
        handleDeletePdndClient(row.clientId);
        utils.dialog.close();
      }
    });
  };

  const handleDeletePdndClient = async (clientId?: string) => {
    try {
      if (!clientId) throw new Error(t('errors.missingClientId'));
      await deletePdndClientMutation.mutateAsync(clientId);
      pdndClients.applyFilters(values);
      notify.emit(t('commons.done'), 'success');
    } catch (error: unknown) {
      notify.emit(t((error as Error)?.message ?? 'errors.generic'), 'error');
    }
  };

  const pdndClients = useSearch({
    query: pdndClientsQuery,
    filters: values,
    id: ID_PDND_CLIENTS,
    filtersExcluded: ['subUnitName']
  });



  const PdndClientColumns: Array<GridColDef<PdndClientView>> = [
    {
      field: 'subUnitCode',
      headerName: t('organizations.integrations.subUnit'),
      flex: 1,
      sortable: false,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontFamily="monospace" component="span">
          {value}
        </Typography>
      )
    },
    {
      field: 'subUnitName',
      headerName: t('organizations.integrations.subUnitName'),
      flex: 1,
      sortable: false
    },
    {
      field: 'clientName',
      headerName: t('organizations.integrations.clientName'),
      flex: 1
    },
    {
      field: 'clientId',
      headerName: t('organizations.integrations.clientId'),
      flex: 1.5
    },
    {
      field: 'action',
      headerName: '',
      width: 140,
      display: 'flex',
      align: 'center',
      renderCell: ({ row }) => (
        <ActionMenu
          rowId={row.clientId}
          aria-label={t('organizations.integrations.showItem', {
            name: row.subUnitName ?? row.subUnitCode
          })}
          menuItems={[
            {
              icon: <ArrowForwardIcon />,
              label: t('organizations.integrations.showItem'),
              action: () => setSelected(row)
            },
            {
              icon: <TrashCanIcon />,
              label: t('organizations.integrations.deleteItem'),
              action: () => confirmDeletePdndClient(row)
            },
          ]}
        />
      )
    }
  ];

  return (
    <Stack gap={5}>
      {selected && (
        <PdndSendServiceDialog
          open
          service={selected}
          organizationId={organizationId}
          onClose={() => setSelected(undefined)}
        />
      )}
      <FilterContainer
        items={filterItems}
        values={values}
        onChange={(id, value) =>
          setValues((prev) => ({ ...prev, [id]: value as string }))
        }
        onSubmit={() => {
          pdndServices.applyFilters(values);
          pdndClients.applyFilters(values);
        }}
      />
      <Stack gap={3} component="section">
        <Typography variant="h5" component="h2">
          {t('organizations.integrations.pdndServices')}
        </Typography>
        <CustomDataGrid
          id={ID_PDND_SERVICES}
          rows={pdndServicesQuery?.data?.content ?? []}
          getRowId={(row: PdndServiceView) => row.purposeId ?? row.clientId}
          columns={PdndServiceColumns}
          totalPages={pdndServicesQuery?.data?.totalPages ?? 0}
          disableColumnMenu
        />
      </Stack>

      <Stack gap={3} component="section">
        <Typography variant="h5" component="h2">
          {t('organizations.integrations.pdndClients')}
        </Typography>
        <CustomDataGrid
          id={ID_PDND_CLIENTS}
          rows={pdndClientsQuery?.data?.content ?? []}
          getRowId={(row: PdndClientView) => row.clientId ?? row.clientId}
          columns={PdndClientColumns}
          totalPages={pdndClientsQuery?.data?.totalPages ?? 0}
          disableColumnMenu
        />
      </Stack>
    </Stack>
  );
};
