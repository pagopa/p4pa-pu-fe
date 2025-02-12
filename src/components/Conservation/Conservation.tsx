import { Box, Grid, IconButton, useTheme } from '@mui/material';
import { Downloading, Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import DownloadIcon from '@mui/icons-material/Download';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomDataGrid from '../DataGrid/CustomDataGrid';

export const Conservation = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  interface FlowDataRow {
    id: number;
    name: string;
    paymentFromDate: string;
    paymentToDate: string;
    size: string;
  }

  const rows: FlowDataRow[] = [
    {
      id: 1,
      name: 'Esportazione 1',
      paymentFromDate: '05/10/2024',
      paymentToDate: '05/11/2024',
      size: '100 bytes'
    },
    {
      id: 2,
      name: 'Esportazione 2',
      paymentFromDate: '10/11/2024',
      paymentToDate: '10/12/2024',
      size: '200 bytes'
    },
    {
      id: 3,
      name: 'Esportazione 3',
      paymentFromDate: '15/09/2024',
      paymentToDate: '15/10/2024',
      size: '300 bytes'
    },
    {
      id: 4,
      name: 'Esportazione 4',
      paymentFromDate: '20/08/2024',
      paymentToDate: '20/09/2024',
      size: '200 bytes'
    }
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('flowDataGrid.name'), flex: 1, type: 'string' },
    {
      field: 'paymentFromDate',
      headerName: t('flowDataGrid.paymentFromDate'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'paymentToDate',
      headerName: t('flowDataGrid.paymentToDate'),
      flex: 1,
      type: 'string'
    },
    { field: 'size', headerName: t('commons.files.size'), flex: 1, type: 'string' },
    {
      field: 'download',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<FlowDataRow>) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            console.log(`Download ID: ${params.row.id}`);
          }}>
          <DownloadIcon />
        </IconButton>
      )
    }
  ];

  return (
    <>
      <TitleComponent
        title={t('commons.routes.CONSERVATION')}
        callToAction={[
          {
            icon: <Downloading />,
            variant: 'outlined',
            buttonText: t('conservation.buttonReservationExport'),
            onActionClick: () => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION)
          }
        ]}
        description={t('conservation.description')}
      />
      <Grid
        container
        direction="row"
        spacing={2}
        alignItems={'center'}
        justifyContent={'space-between'}
        my={2}>
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchName'),
              icon: <Search />,
              gridWidth: 5
            },
            {
              type: COMPONENT_TYPE.dateRange,
              label: 'dateRange',
              gridWidth: 6,
              from: { label: t('conservation.exportFrom') }
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.filters.filterResults'),
              gridWidth: 1,
              onClick: () => console.log('Filter applied')
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

export default Conservation;
