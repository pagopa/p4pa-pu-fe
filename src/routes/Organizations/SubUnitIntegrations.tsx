import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import FilterContainer, {
  COMPONENT_TYPE,
  FilterItem
} from '../../components/FilterContainer/FilterContainer';
import { PdndServiceView } from '../../../generated/core/data-contracts';

type Filters = { subUnitCode?: string };

// not wired yet: the sub-unit e-services API is still to be built
export const SubUnitIntegrations = () => {
  const { t } = useTranslation();
  const [values, setValues] = useState<Filters>({});
  const rows: Array<PdndServiceView> = [];

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
      renderCell: ({ value }) => (
        <Typography variant="body2" fontFamily="monospace" component="span">
          {value}
        </Typography>
      )
    },
    {
      field: 'subUnitName',
      headerName: t('organizations.integrations.subUnitName'),
      flex: 1
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
        // not wired yet
        <Button
          variant="text"
          endIcon={<ArrowForwardIcon />}
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
      <FilterContainer
        items={filterItems}
        values={values}
        onChange={(id, value) =>
          setValues((prev) => ({ ...prev, [id]: value as string }))
        }
        // not wired yet
        onSubmit={() => undefined}
      />
      <Stack gap={3} component="section">
        <Typography variant="h5" component="h2">
          {t('organizations.integrations.pdndServices')}
        </Typography>
        <CustomDataGrid
          rows={rows}
          getRowId={(row: PdndServiceView) => row.purposeId ?? row.clientId}
          columns={columns}
          totalPages={0}
          disableColumnMenu
          disableColumnResize
          disableColumnSorting
        />
      </Stack>
    </Stack>
  );
};
