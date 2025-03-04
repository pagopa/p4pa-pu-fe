import { Box, Chip, Grid, IconButton, useTheme } from '@mui/material';
import { Search, Upload } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import ActionMenu from '../ActionMenu/ActionMenu';
import TitleComponent from '../TitleComponent/TitleComponent';
import { DOWNLOAD_STATES, FLOW_STATUS_VALUES, FlowStatus, MENU_STATES, STATE_COLORS } from '../../models/Filters';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../App';
import { useState } from 'react';

const DebtPositionsImportOverview = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchName, setSearchName] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null}>({from: null, to: null});

  const handleApplyFilters = () => {
    console.log('applied filters:', {
      searchName,
      selectedState,
      dateRange: {
        from: dateRange.from?.toISOString(),
        to: dateRange.to?.toISOString()
      }
    }
    );
  };

  const renderActionCell = (params: GridRenderCellParams) => {
    const { id, status } = params.row;

    if (MENU_STATES.includes(status)) {
      return (
        <ActionMenu 
          rowId={id}
          menuItems={[
            {
              icon: <DownloadIcon fontSize="small" color='primary' />,
              label: t('commons.files.imported'),
              action: () => console.log('Download file:', id),
            },
            {
              icon: <DownloadIcon fontSize="small" color='primary' />,
              label: t('commons.files.importedResult'),
              action: () => console.log('Download result:', id),
            },
          ]}
        />
      );
    }

    if (DOWNLOAD_STATES.includes(status)) {
      return (
        <IconButton
          color="primary"
          size="small"
          onClick={() => console.log(`Download: ${id}`)}
          data-testid='download-button'
        >
          <DownloadIcon />
        </IconButton>
      );
    }

    return null;
  };

  const columns: GridColDef[] = [
    { 
      field: 'internalID', 
      headerName: t('flowDataGrid.internalID'), 
      flex: 1, 
      type: 'number', 
      headerAlign: 'left', 
      align: 'left' 
    },
    { 
      field: 'fileName', 
      headerName: t('flowDataGrid.name'), 
      flex: 1, 
      type: 'string' 
    },
    { 
      field: 'uploadDate', 
      headerName: t('flowDataGrid.uploadDate'), 
      flex: 1, 
      type: 'string',
      renderCell: (params: GridRenderCellParams) => 
        params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''
    },
    { 
      field: 'operator', 
      headerName: t('flowDataGrid.operator'), 
      flex: 1, 
      type: 'string' 
    },
    { 
      field: 'loadedDiscarded', 
      headerName: t('flowDataGrid.loadedDiscarded'), 
      flex: 1, 
      type: 'string', 
      headerAlign: 'left', 
      align: 'left' 
    },
    {
      field: 'status',
      headerName: t('commons.state'),
      flex: 0.5,
      type: 'string',
      valueFormatter: ({ value }) => t(`commons.status.${value}`, value),
      renderCell: (params) => (
        <Chip
          label={t(`commons.status.${params.value}`)}
          color={STATE_COLORS[params.value as FlowStatus] || 'default'}
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
      renderCell: renderActionCell,
    }
  ];

  const rows = [
    {
      id: 1,
      internalID: '1117685',
      fileName: 'IPA_TEST_2324234234',
      uploadDate: '05/10/2024 10:06:55',
      operator: 'Sistema Informativo',
      loadedDiscarded: '100/3',
      status: 'UPLOADED'
    },
    {
      id: 2,
      internalID: '1114185',
      fileName: 'IPA_TEST_74524234234',
      uploadDate: '05/10/2024 11:06:55',
      operator: 'Sistema Informativo',
      loadedDiscarded: '100/100',
      status: 'PROCESSING'
    },
    {
      id: 3,
      internalID: '1357685',
      fileName: 'IPA_TEST_11134234',
      uploadDate: '07/10/2024 12:06:55',
      operator: 'Sistema Informativo',
      loadedDiscarded: '100/0100',
      status: 'COMPLETED'
    },
    {
      id: 4,
      internalID: '4117685',
      fileName: 'IPA_TEST_5324234234',
      uploadDate: '08/10/2024 10:06:55',
      operator: 'Sistema Informativo',
      loadedDiscarded: '0/0',
      status: 'ERROR'
    }
  ];

  return (
    <>
      <TitleComponent
        title={t('commons.debtFlow')}
        callToAction={[
          {
            icon: <Upload />,
            variant: 'outlined',
            buttonText: t('commons.importFlowButton'),
            onActionClick: () => navigate(generatePath(PageRoutes.IMPORT_FLOWS, { category: 'debt-positions' }))
          }
        ]}
      />

      <Grid container direction="row" sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2
      }}>
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchName'),
              icon: <Search />,
              gridWidth: 5,
              value: searchName,
              onChange:(e) => setSearchName(e.target.value) 
            },
            {
              type: COMPONENT_TYPE.select,
              label: t('commons.state'),
              gridWidth: 2,
              options: [
                { label: t('commons.status.ALL'), value: 'ALL' },
                ...FLOW_STATUS_VALUES.map(status => ({
                  label: t(`commons.status.${status}`),
                  value: status
                }))
              ],
              value: selectedState,
              onChange:(e) => setSelectedState(e.target.value as string) 
            },
            { 
              type: COMPONENT_TYPE.dateRange,
              label: 'dateRange',
              gridWidth: 4,
              from: {
                label: t('dates.from'),
                errorMessage: t('dates.validations.from'),
                onChange: (date: Date | null) => setDateRange(prev => ({ ...prev, from: date}))
              },
              to: {
                label: t('dates.to'),
                errorMessage: t('dates.validations.to'),
                onChange: (date: Date | null) => setDateRange(prev => ({ ...prev, to: date}))
              }
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.filters.filterResults'),
              gridWidth: 1,
              onClick: handleApplyFilters
            }
          ]}
        />
      </Grid>

      <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
        <CustomDataGrid
          rows={rows}
          columns={columns}
          disableColumnMenu
          disableColumnResize
          hideFooter
        />
      </Box>
    </>
  );
};

export default DebtPositionsImportOverview;
