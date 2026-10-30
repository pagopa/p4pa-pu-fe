import { useParams } from 'react-router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PdndServiceView } from '@generated/core/data-contracts';

import { getOrgSubUnitsPdndServices } from '@core/api/integrations';
import CustomDataGrid from '@core/components/DataGrid/CustomDataGrid';
import type { FilterItem } from '@core/components/FilterContainer/FilterContainer';
import FilterContainer, {
  COMPONENT_TYPE
} from '@core/components/FilterContainer/FilterContainer';
import { useSearch } from '@core/hooks/useSearch';

import { PdndSendServiceDialog } from '../Dialogs/ServiceDialog';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Filters = { subUnitCode?: string };

export const SubUnitIntegrations = () => {
  const { t } = useTranslation();
  const [values, setValues] = useState<Filters>({});
  const [selected, setSelected] = useState<PdndServiceView>();

  const { organizationId: urlOrganizationId } = useParams();
  const organizationId = Number(urlOrganizationId);

  const query = getOrgSubUnitsPdndServices(organizationId);

  const pdndServices = useSearch({
    query,
    filters: values
  });

  const filterItems: Array<FilterItem> = [
    {
      type: COMPONENT_TYPE.textField,
      label: t('organizations.integrations.searchSubUnit'),
      gridWidth: 10,
      id: 'subUnitCode'
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 2,
      id: 'applyFilters'
    }
  ];

  const columns: Array<GridColDef<PdndServiceView>> = [
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
        <Button
          variant="text"
          endIcon={<ArrowForwardIcon />}
          onClick={() => setSelected(row)}
          aria-label={t('organizations.integrations.showItem', {
            name: row.subUnitName ?? row.subUnitCode
          })}
        >
          {t('organizations.integrations.show')}
        </Button>
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
          onDelete={() => pdndServices.applyFilters(values)}
        />
      )}
      <FilterContainer
        items={filterItems}
        values={values}
        onChange={(id, value) =>
          setValues((prev) => ({ ...prev, [id]: value as string }))
        }
        onSubmit={() => pdndServices.applyFilters(values)}
      />
      <Stack gap={3} component="section">
        <Typography variant="h5" component="h2">
          {t('organizations.integrations.pdndServices')}
        </Typography>
        <CustomDataGrid
          rows={query?.data?.content ?? []}
          getRowId={(row: PdndServiceView) => row.purposeId ?? row.clientId}
          columns={columns}
          totalPages={0}
          disableColumnMenu
        />
      </Stack>
    </Stack>
  );
};
