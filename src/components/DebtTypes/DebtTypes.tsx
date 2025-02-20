import { Box, Grid, IconButton, useTheme } from '@mui/material';
import { Add, ChevronRight, Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomDataGrid from '../DataGrid/CustomDataGrid';

export const DebtTypes = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  interface DebtTypesDataRow {
    id: number;
    name: string;
    lastUpdate: string;
    authorizedOrganizations: string;
  }

  const rows: DebtTypesDataRow[] = [
    {
      id: 1,
      name: 'Cosap/Tosap',
      lastUpdate: '24/03/2021 14:12',
      authorizedOrganizations: '1400'
    },
    {
      id: 2,
      name: 'Imposta pubblicità e diritti affissione',
      lastUpdate: '24/03/2021 14:12',
      authorizedOrganizations: '25'
    },
    {
      id: 3,
      name: 'Verbale amministrativo',
      lastUpdate: '24/03/2021 14:12',
      authorizedOrganizations: '20'
    }
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('flowDataGrid.name'), flex: 1, type: 'string' },
    { field: 'lastUpdate', headerName: t('flowDataGrid.lastUpdate'), flex: 1, type: 'string' },
    { field: 'authorizedOrganizations', headerName: t('flowDataGrid.authorizedOrganizations'), flex: 1, type: 'string' },
    {
      field: 'detail',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<DebtTypesDataRow>) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            console.log(`detail: ${params.row.name}`);
          }}>
          <ChevronRight />
        </IconButton>
      )
    }
  ];

  return (
    <>
      <TitleComponent 
        title= {t('commons.routes.DEBT_TYPES_CATALOG')} 
        callToAction={
          [
            {
              icon: <Add />, 
              buttonText: t('commons.createNew'), 
              onActionClick: () => console.log('create new')
            },
          ]
        } 
        description= {t('debtTypes.description')}
      />
      <Grid
        container
        direction="row"
        spacing={3}
        alignItems={'center'}
        justifyContent={'space-between'}
        my={2}>
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('debtTypes.searchDescription'),
              icon: <Search />,
              gridWidth: 11
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.search'),
              gridWidth: 1,
              onClick: () => console.log('Search')
            }
          ]}
        />
      </Grid>
      <Box
        sx={{
          bgcolor: theme.palette.grey[200],
          padding: 2
        }}>
        <CustomDataGrid
          rows={rows}
          columns={columns}
          hideFooter
          disableColumnMenu
          disableColumnResize
        />
      </Box>
    </>
  );
};

export default DebtTypes;
