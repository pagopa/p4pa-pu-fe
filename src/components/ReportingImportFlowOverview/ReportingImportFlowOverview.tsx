import { Box, Chip, Grid, IconButton, useTheme } from '@mui/material';
import { CalendarToday, Search, Upload } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import ActionMenu from '../ActionMenu/ActionMenu';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes/routes';

export const ReportingImportFlowOverview = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      name: 'Import 1',
      date: '05/11/2024',
      operator: 'Sistema Informativo 1',
      loadedDiscarded: '1000/1',
      state: 'Elaborato'
    },
    {
      id: 2,
      internalID: '2222222',
      name: 'Import 2',
      date: '06/11/2024',
      operator: 'Sistema Informativo 2',
      loadedDiscarded: '1000/2',
      state: 'Caricato'
    },
    {
      id: 3,
      internalID: '3333333',
      name: 'Import 3',
      date: '06/11/2024',
      operator: 'Sistema Informativo 3',
      loadedDiscarded: '1000/3',
      state: 'In Elaborazione'
    },
    {
      id: 4,
      internalID: '4444444',
      name: 'Import 4',
      date: '07/11/2024',
      operator: 'Sistema Informativo 4',
      loadedDiscarded: '1000/4',
      state: 'Errore'
    },
  ];

  const stateColors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info' } = {
    'Elaborato': 'success',
    'Caricato': 'info',
    'In Elaborazione': 'info',
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
      headerName: t('commons.state'),
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
                label: t('commons.files.imported'),
                action: () => console.log('Scarica file per ID: ', params.row.id),
              },
              {
                icon: <DownloadIcon fontSize="small" color='primary'/>,
                label: t('commons.files.importedResult'),
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
          <TitleComponent 
            title={t('commons.routes.REPORTING_IMPORT_FLOW_OVERVIEW')} 
            callToAction={
              [
                {
                  icon: <Upload/>, 
                  variant: 'outlined', 
                  buttonText: t('reportingImportFlowOverview.importFlowButton'), 
                  onActionClick: () => navigate(PageRoutes.REPORTING_IMPORT_FLOW)
                },
              ]
            } 
            description={t('reportingImportFlowOverview.description')} 
          />
          <Grid container direction="row" spacing={2}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 2
            }}>
            <FilterContainer
              items={[
                { type: COMPONENT_TYPE.textField, label: t('commons.searchName'), icon: <Search />, gridWidth: 5 },
                { type: COMPONENT_TYPE.select, label: t('commons.state'), gridWidth: 2, options: [
                  { label: t('commons.states.uploaded'), value: 'Caricato' },
                  { label: t('commons.states.cancelled'), value: 'Annullato' },
                ]},
                { type: COMPONENT_TYPE.textField, label: t('commons.from'), icon: <CalendarToday />, gridWidth: 2 },
                { type: COMPONENT_TYPE.textField, label: t('commons.to'), icon: <CalendarToday />, gridWidth: 2 },
                { type: COMPONENT_TYPE.button, label: t('commons.filters.filterResults'), gridWidth: 1, onClick: () => console.log('Filter applied') },
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

export default ReportingImportFlowOverview;
