import { Box, Chip, Grid, IconButton, useTheme } from '@mui/material';
import { CalendarToday, Search, Upload } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import ActionMenu from '../ActionMenu/ActionMenu';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useState } from 'react';
import { useIngestionFlowFiles } from '../../api/ingestionFlowFiles';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

const TelematicReceiptImportFlowOverview = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    flowFileType: 'RECEIPT',
  });

  const { state } = useStore();
  const organizationId = state[STATE.ORGANIZATION_ID]?.organizationId;

  console.log(organizationId);

  const { data } = useIngestionFlowFiles(organizationId ?? 0, filters);

  const stateColors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' } = {
    'COMPLETED': 'success',
    'UPLOADED': 'primary',
    'PROCESSING': 'warning',
    'EXPIRED': 'secondary',
    'ERROR': 'error',
  };

  const columns: GridColDef[] = [
    { field: 'ingestionFlowFileId', headerName: t('flowDataGrid.internalID'), flex: 1, type: 'number' },
    { field: 'fileName', headerName: t('flowDataGrid.name'), flex: 1, type: 'string' },
    { field: 'creationDate', headerName: t('flowDataGrid.reservationDate'), flex: 1, type: 'string' },
    { field: 'operator', headerName: t('flowDataGrid.operator'), flex: 1, type: 'string' },
    { field: 'discardedRows', headerName: t('flowDataGrid.loadedDiscarded'), flex: 1, type: 'number' },
    {
      field: 'status',
      headerName: t('commons.state'),
      flex: 0.5,
      type: 'string',
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={stateColors[params.value] || 'default'}
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
      renderCell: (params: GridRenderCellParams) => {
        const { ingestionFlowFileId, status } = params.row;
        const menuStates = ['COMPLETED', 'ERROR'];
        const downloadStates = ['UPLOADED'];
    
        if (menuStates.includes(status)) {
          return (
            <ActionMenu 
              rowId={ingestionFlowFileId}
              menuItems={[
                {
                  icon: <DownloadIcon fontSize="small" color='primary' />,
                  label: t('commons.files.imported'),
                  action: () => console.log('Scarica file per ID:', ingestionFlowFileId),
                },
                {
                  icon: <DownloadIcon fontSize="small" color='primary' />,
                  label: t('commons.files.importedResult'),
                  action: () => console.log('Download esito importazione per ID:', ingestionFlowFileId),
                },
              ]}
            />
          );
        }
    
        if (downloadStates.includes(status)) {
          return (
            <IconButton
              color="primary"
              size="small"
              onClick={() => console.log(`Download ID: ${ingestionFlowFileId}`)}
            >
              <DownloadIcon />
            </IconButton>
          );
        }
    
        return null;
      },
    }
    
  ];

  return (
    <>
      <TitleComponent 
        title={t('commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW')} 
        callToAction={[
          {
            icon: <Upload/>, 
            variant: 'outlined', 
            buttonText: t('telematicReceiptImportFlowOverview.importFlowButton'), 
            onActionClick: () => navigate(generatePath(PageRoutes.IMPORT_FLOWS, {category: 'telematic-receipt'}))
          },
        ]} 
        description={t('telematicReceiptImportFlowOverview.description')} 
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
              { label: 'Caricato', value: 'Caricato' },
              { label: 'Annullato', value: 'Annullato' },
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
          rows={data?.content || []}
          columns={columns}
          getRowId={(row) => row.ingestionFlowFileId}
          hideFooter
          disableColumnMenu
          disableColumnResize
        />
      </Box>
    </>
  );
};

export default TelematicReceiptImportFlowOverview;
