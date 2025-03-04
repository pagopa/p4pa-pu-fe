import { Box, Chip, Grid, IconButton, useTheme } from '@mui/material';
import { Search, Upload } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import ActionMenu from '../ActionMenu/ActionMenu';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../App';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useStore } from '../../store/GlobalStore';
import { DOWNLOAD_STATES, FLOW_STATUS_VALUES, FlowFileType, FlowStatus, MENU_STATES, STATE_COLORS } from '../../models/Filters';
import { getIngestionFlowFiles } from '../../api/ingestionFlowFiles';
import { useFlowFilters } from '../../hooks/useFlowFilters';
import { STATE } from '../../store/types';

export interface ImportFlowOverviewProps {
  routingCategory: string;
  title: string;
  description: string;
  flowFileTypes: FlowFileType[];
}

const ImportFlowOverview :React.FC<ImportFlowOverviewProps> = ({
  routingCategory,
  title,
  description,
  flowFileTypes
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const {
    appliedFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    handleDateFromChange,
    handleDateToChange,
    hasActiveFilters,
    sortModel,
    handleSortModelChange
  } = useFlowFilters({
    flowFileTypes: flowFileTypes,
  });

  const { data } = getIngestionFlowFiles(organizationId, appliedFilters);


  const renderActionCell = (params: GridRenderCellParams) => {
    const { ingestionFlowFileId, status } = params.row;

    if (MENU_STATES.includes(status)) {
      return (
        <ActionMenu
          rowId={ingestionFlowFileId}
          menuItems={[
            {
              icon: <DownloadIcon fontSize="small" color='primary' />,
              label: t('commons.files.imported'),
              action: () => console.log('Download file:', ingestionFlowFileId),
            },
            {
              icon: <DownloadIcon fontSize="small" color='primary' />,
              label: t('commons.files.importedResult'),
              action: () => console.log('Download result:', ingestionFlowFileId),
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
          onClick={() => console.log(`Download: ${ingestionFlowFileId}`)}
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
      field: 'ingestionFlowFileId',
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
      field: 'creationDate',
      headerName: t('flowDataGrid.reservationDate'),
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
      field: 'discardedRows',
      headerName: t('flowDataGrid.loadedDiscarded'),
      flex: 1,
      type: 'number',
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

  return (
    <>
      <TitleComponent
        title={title}
        callToAction={[
          {
            icon: <Upload />,
            variant: 'outlined',
            buttonText: t('commons.importFlowButton'),
            onActionClick: () =>
              navigate(generatePath(PageRoutes.IMPORT_FLOWS, { category: routingCategory }))
          }
        ]}
        description={description}
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
              value: draftFilters.fileName || '',
              onChange: (e) => updateDraftFilters({ fileName: e.target.value })
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
              value: draftFilters.status || 'ALL',
              onChange: (e) => {
                const value = e.target.value;
                updateDraftFilters({
                  status: value === 'ALL' ? undefined : value as FlowStatus
                });
              }
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
              onClick: applyFilters,
              disabled: !hasActiveFilters()
            }
          ]}
        />
      </Grid>

      <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
        <CustomDataGrid
          rows={data?.content || []}
          columns={columns}
          getRowId={(row) => row.ingestionFlowFileId}
          disableColumnMenu
          disableColumnResize
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          customPagination={{
            totalPages: data?.totalPages,
            defaultPageOption: appliedFilters.size,
            sizePageOptions: [5, 10, 15, 20],
            onPageChange: (page) => updatePagination({ page: page - 1, size: appliedFilters.size }),
            onPageSizeChange: (size) => updatePagination({ size, page: 0 }),
            currentPage: appliedFilters.page + 1
          }}
        />
      </Box>
    </>
  );
};

export default ImportFlowOverview;
