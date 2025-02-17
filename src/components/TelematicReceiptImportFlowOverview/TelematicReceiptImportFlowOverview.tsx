import { Box, Chip, ChipOwnProps, Grid, IconButton, useTheme } from '@mui/material';
import { Search, Upload } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import ActionMenu from '../ActionMenu/ActionMenu';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useState, useCallback } from 'react';
import { getIngestionFlowFiles } from '../../api/ingestionFlowFiles';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { useDataGridPagination } from '../../hooks/useDatagridPagination';

interface FilterState {
  flowFileTypes: ('RECEIPT' | 'RECEIPT_PAGOPA' | 'PAYMENTS_REPORTING' | 'PAYMENTS_REPORTING_PAGOPA' | 'TREASURY_OPI' | 'TREASURY_CSV' | 'TREASURY_XLS' | 'TREASURY_POSTE')[];
  fileName?: string;
  status?: string;
  creationDateFrom?: string;
  creationDateTo?: string;
  size: number;
  page: number;
}

const TelematicReceiptImportFlowOverview = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>({
    flowFileTypes: ['RECEIPT'],
    size: 10,
    page: 0,
  });
  
  const [filterFields, setFilterFields] = useState<Partial<FilterState>>({});

  const { state } = useStore();
  const { pagination, handlePageChange, handlePageSizeChange } = useDataGridPagination({
    initialSize: filters.size,
    initialPage: filters.page,
    onPaginationChange: (newPagination) => {
      setFilters(prev => ({
        ...prev,
        size: newPagination.size,
        page: newPagination.page
      }));
    }
  });

  const organization = state[STATE.ORGANIZATION_ID];
  const organizationId = Number(organization);
  
  const { data } = getIngestionFlowFiles(organizationId, {
    ...filters,
  });

  const handleFilterChange = useCallback((type: keyof FilterState, value: unknown) => {
    setFilterFields(prev => ({
      ...prev,
      [type]: value,
    }));
  }, []);

  const handleDateFromChange = useCallback((date: Date | null) => {
    setFilterFields(prev => ({
      ...prev,
      creationDateFrom: date ? 
        new Date(date.setHours(0, 0, 0, 0)).toISOString() : 
        undefined,
    }));
  }, []);

  const handleDateToChange = useCallback((date: Date | null) => {
    setFilterFields(prev => ({
      ...prev,
      creationDateTo: date ? 
        new Date(date.setHours(23, 59, 59, 999)).toISOString() : 
        undefined,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      ...filterFields,
      page: 0
    }));
  }, [filterFields]);

  const stateColors: Record<string, ChipOwnProps['color']> = {
    'COMPLETED': 'success',
    'UPLOADED': 'primary',
    'PROCESSING': 'primary',
    'EXPIRED': 'secondary',
    'ERROR': 'error',
  };
  
  const columns: GridColDef[] = [
    { field: 'ingestionFlowFileId', headerName: t('flowDataGrid.internalID'), flex: 1, type: 'number', headerAlign: 'left', align: 'left' },
    { field: 'fileName', headerName: t('flowDataGrid.name'), flex: 1, type: 'string' },
    { field: 'creationDate', headerName: t('flowDataGrid.reservationDate'), flex: 1, type: 'string', 
      renderCell: (params: GridRenderCellParams) => params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''    
    },
    { field: 'operator', headerName: t('flowDataGrid.operator'), flex: 1, type: 'string' },
    { field: 'discardedRows', headerName: t('flowDataGrid.loadedDiscarded'), flex: 1, type: 'number', headerAlign: 'left', align: 'left' },
    {
      field: 'status',
      headerName: t('commons.state'),
      flex: 0.5,
      type: 'string',
      sortable: true,
      valueFormatter: (params: { value: string }) => t(`common.status.${params.value}`, params.value),
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={t(`commons.status.${params.value}`, params.value).toString()}
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
              data-testid='download-button'
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
            icon: <Upload />,
            variant: 'outlined',
            buttonText: t('telematicReceiptImportFlowOverview.importFlowButton'),
            onActionClick: () =>
              navigate(generatePath(PageRoutes.IMPORT_FLOWS, { category: 'telematic-receipt' }))
          }
        ]}
        description={t('telematicReceiptImportFlowOverview.description')}
      />
      <Grid
        container
        direction="row"
        spacing={2}
        sx={{
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
              value: filterFields.fileName ?? filters.fileName ?? '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                handleFilterChange('fileName', e.target.value)
            },
            {
              type: COMPONENT_TYPE.select,
              label: t('commons.state'),
              gridWidth: 2,
              options: [
                { label: t('commons.status.UPLOADED'), value: 'UPLOADED' },
                { label: t('commons.status.PROCESSING'), value: 'PROCESSING' },
                { label: t('commons.status.COMPLETED'), value: 'COMPLETED' },
                { label: t('commons.status.ERROR'), value: 'ERROR' }
              ],
              value: filterFields.status ?? filters.status ?? '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                handleFilterChange('status', e.target.value)
            },
            { 
              type: COMPONENT_TYPE.dateRange,
              label: 'dateRange',
              gridWidth: 4,
              from: {
                label: t('dates.from'),
                errorMessage: t('dates.validations.from'),
                onChange: handleDateFromChange
              },
              to: {
                label: t('dates.to'),
                errorMessage: t('dates.validations.to'),
                onChange: handleDateToChange
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

      <Box
        sx={{
          bgcolor: theme.palette.grey[200],
          padding: 2
        }}>
        <CustomDataGrid
          rows={data?.content || []}
          columns={columns}
          getRowId={(row) => row.ingestionFlowFileId}
          disableColumnMenu
          disableColumnResize
          customPagination={{
            totalPages: data?.totalPages,
            defaultPageOption: pagination.size,
            sizePageOptions: [5, 10, 15, 20],
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
            currentPage: pagination.currentPage
          }}
        />
      </Box>
    </>
  );
};

export default TelematicReceiptImportFlowOverview;
