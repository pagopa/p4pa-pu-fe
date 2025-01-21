import { Box, Button, Chip, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { CalendarToday, Search, Upload } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import FilterContainer, { COMPONENT_TYPE } from './FilterContainer';
import ActionMenu from '../ActionMenu/ActionMenu';

const TelematicReceiptImportFlowOverview = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  interface FlowDataRow {
    id: number;
    internalID: string;
    name: string;
    date: string;
    operator: string;
    loadedDiscarded: string;
    state: string;
  }

  const rows: FlowDataRow[] = [
    {
      id: 1,
      internalID: '1111111',
      name: 'Esportazione 1',
      date: '05/11/2024',
      operator: 'Sistema Informativo 1',
      loadedDiscarded: '1000/1',
      state: 'Elaborato'
    },
    {
      id: 2,
      internalID: '2222222',
      name: 'Esportazione 2',
      date: '06/11/2024',
      operator: 'Sistema Informativo 2',
      loadedDiscarded: '1000/2',
      state: 'Caricato'
    },
    {
      id: 3,
      internalID: '3333333',
      name: 'Esportazione 3',
      date: '06/11/2024',
      operator: 'Sistema Informativo 3',
      loadedDiscarded: '1000/3',
      state: 'In Elaborazione'
    },
    {
      id: 4,
      internalID: '4444444',
      name: 'Esportazione 4',
      date: '07/11/2024',
      operator: 'Sistema Informativo 4',
      loadedDiscarded: '1000/4',
      state: 'Errore'
    },
  ];

  const stateColors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' } = {
    'Elaborato': 'success',
    'Caricato': 'primary',
    'In Elaborazione': 'primary',
    'Errore': 'error',
  };

  const columns: GridColDef[] = [
    { field: 'internalID', headerName: t('flowDataGrid.internalID'), flex: 1, type: 'string' },
    { field: 'name', headerName: t('flowDataGrid.name'), flex: 1, type: 'string' },
    { field: 'date', headerName: t('flowDataGrid.reservationDate'), flex: 1, type: 'string' },
    { field: 'operator', headerName: t('flowDataGrid.operator'), flex: 1, type: 'string' },
    { field: 'loadedDiscarded', headerName: t('flowDataGrid.loadedDiscarded'), flex: 1, type: 'string' },
    {
      field: 'state',
      headerName: t('telematicReceiptImportFlowOverview.state'),
      flex: 1,
      type: 'string',
      sortable: true,
      renderCell: (params: GridRenderCellParams<FlowDataRow>) => (
        <Chip
          label={params.value}
          color={stateColors[params.value]}
          size="small"
        />
      ),
    },
    {
      field: 'menu',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<FlowDataRow>) => {
        const { state, id } = params.row;
        const menuStates = ['Elaborato', 'Errore'];
        const downloadStates = ['Caricato'];

        if (menuStates.includes(state)) {
          return <ActionMenu 
            rowId={id}
            menuItems={[
              {
                icon: <DownloadIcon fontSize="small" color='primary'/>,
                label: t('actionMenu.importFile'),
                action: () => console.log('Scarica file per ID: ', params.row.id),
              },
              {
                icon: <DownloadIcon fontSize="small" color='primary'/>,
                label: t('actionMenu.importResult'),
                action: () => console.log('Download esito importazione per ID: ', params.row.id),
              },
            ]}
          />;
        }
        if (downloadStates.includes(state)) {
          return (
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                console.log(`Download ID: ${params.row.id}`);
              }}
            >
              <DownloadIcon />
            </IconButton>
          );
        }
        else return null;
      },
    }
  ];

  return (
    <>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 2
            }}
          >
            <Typography variant="h3">
              {t('telematicReceiptImportFlowOverview.title')}
            </Typography>
            <Button
              size="large"
              startIcon={<Upload />}
              variant="outlined"
            >
              {t('telematicReceiptImportFlowOverview.importFlowButton')}
            </Button>
          </Box>

          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {t('telematicReceiptImportFlowOverview.description')}
          </Typography>
          <Grid container direction="row" spacing={2}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 2
            }}>
            <FilterContainer
              items={[
                { type: COMPONENT_TYPE.textField, label: t('telematicReceiptImportFlowOverview.searchDescription'), icon: <Search />, gridWidth: 5 },
                { type: COMPONENT_TYPE.select, label: t('telematicReceiptImportFlowOverview.state'), gridWidth: 2, options: [
                  { label: 'Caricato', value: 'Caricato' },
                  { label: 'Annullato', value: 'Annullato' },
                ]},
                { type: COMPONENT_TYPE.textField, label: t('telematicReceiptImportFlowOverview.from'), icon: <CalendarToday />, gridWidth: 2 },
                { type: COMPONENT_TYPE.textField, label: t('telematicReceiptImportFlowOverview.to'), icon: <CalendarToday />, gridWidth: 2 },
                { type: COMPONENT_TYPE.button, label: t('telematicReceiptImportFlowOverview.filterButton'), gridWidth: 1, onClick: () => console.log('Filter applied') },
              ]}
            />
          </Grid>
          <Box
            sx={{
              bgcolor: theme.palette.grey[200],
              padding: 2
            }}
          >
            <CustomDataGrid
              rows={rows} 
              columns={columns} 
              hideFooter
              disableColumnMenu
              disableColumnResize
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default TelematicReceiptImportFlowOverview;