import { Box, Chip, Grid, IconButton, useTheme } from '@mui/material';
import { Search, Upload } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect } from 'react';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import FilterContainer, {
  COMPONENT_TYPE
} from '../FilterContainer/FilterContainer';
import ActionMenu from '../ActionMenu/ActionMenu';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../App';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useStore } from '../../store/GlobalStore';
import {
  DOWNLOAD_STATES,
  FlowStatus,
  MENU_STATES,
  STATE_COLORS
} from '../../models/Filters';
import {
  getIngestionFlowFile,
  getIngestionFlowFileError,
  getIngestionFlowFiles
} from '../../api/ingestionFlowFiles';
import { useFlowFilters } from '../../hooks/useFlowFilters';
import { useDataGridPaginationWithUrl } from '../../hooks/useDataGridPaginationWithUrl';
import { STATE } from '../../store/types';
import {
  IngestionFlowFile,
  IngestionFlowFileStatus,
  IngestionFlowFileTypeEnum
} from '../../../generated/apiClient';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';
import EmptyDataGrid from '../EmptyDataGrid/EmptyDataGrid';

export type ImportFlowOverviewProps = {
  routingCategory: string;
  title: string;
  description?: string;
  ingestionFlowFileTypes: Array<IngestionFlowFileTypeEnum>;
};

const ImportFlowOverview = ({
  routingCategory,
  title,
  description,
  ingestionFlowFileTypes
}: ImportFlowOverviewProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const {
    appliedFilters: baseFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters: baseApplyFilters,
    handleDateFromChange,
    handleDateToChange,
    hasActiveFilters,
    sortModel,
    handleSortModelChange
  } = useFlowFilters({
    ingestionFlowFileTypes: ingestionFlowFileTypes
  });

  const { data: initialData } = getIngestionFlowFiles(
    organizationId,
    baseFilters
  );

  const urlPagination = useDataGridPaginationWithUrl({
    initialPage: 0,
    initialSize: 10,
    totalElements: initialData?.totalElements || 0
  });

  const appliedFilters = {
    ...baseFilters,
    page: urlPagination.pagination.page,
    size: urlPagination.pagination.size
  };

  const updatePagination = ({ page, size }: { page: number; size: number }) => {
    const currentPage = urlPagination.pagination.page;
    const currentSize = urlPagination.pagination.size;

    if (size !== currentSize) {
      urlPagination.handlePageSizeChange(size);
    } else if (page !== currentPage) {
      urlPagination.handlePageChange(page + 1);
    }
  };

  const applyFilters = () => {
    urlPagination.handlePageChange(1);
    baseApplyFilters();
  };

  const { data } = getIngestionFlowFiles(organizationId, appliedFilters);

  const isEmptyData = !data?.content || data.content.length === 0;

  useEffect(() => {
    if (data) {
      const currentPage = urlPagination.pagination.page;
      const currentSize = urlPagination.pagination.size;
      const backendPage = data.number || 0;
      const backendSize = data.size || 10;

      if (currentPage !== backendPage || currentSize !== backendSize) {
        urlPagination.syncWithBackendData({
          number: backendPage,
          size: backendSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages
        });
      }
    }
  }, [data?.number, data?.size, data?.totalElements, data?.totalPages]);

  const getIngestionFlowFileErrorMutation =
    getIngestionFlowFileError(organizationId);

  const getIngestionFlowFileMutation = getIngestionFlowFile(organizationId);

  const handleDownloadFile = async (ingestionFlowFileId: number) => {
    try {
      const { data, fileName } =
        await getIngestionFlowFileMutation.mutateAsync(ingestionFlowFileId);
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('FileUploaderFlowImport.error.errorFlowFile'));
    }
  };

  const handleDownloadFileError = async (ingestionFlowFileId: number) => {
    try {
      const { data, fileName } =
        await getIngestionFlowFileErrorMutation.mutateAsync(
          ingestionFlowFileId
        );
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('FileUploaderFlowImport.error.errorFlowFile'));
    }
  };

  const handleImportFlow = () => {
    navigate(
      generatePath(PageRoutes.IMPORT_FLOWS, {
        category: routingCategory
      })
    );
  };

  const renderActionCell = (params: GridRenderCellParams) => {
    const { ingestionFlowFileId, status } = params.row;

    if (MENU_STATES.includes(status)) {
      return (
        <ActionMenu
          rowId={ingestionFlowFileId}
          menuItems={[
            {
              icon: <DownloadIcon fontSize="small" color="primary" />,
              label: t('commons.files.imported'),
              action: () => handleDownloadFile(ingestionFlowFileId)
            },
            {
              icon: <DownloadIcon fontSize="small" color="primary" />,
              label: t('commons.files.importedResult'),
              action: () => handleDownloadFileError(ingestionFlowFileId)
            }
          ]}
        />
      );
    }

    if (DOWNLOAD_STATES.includes(status)) {
      return (
        <IconButton
          color="primary"
          size="small"
          onClick={() => handleDownloadFile(ingestionFlowFileId)}
          data-testid="download-button"
        >
          <DownloadIcon />
        </IconButton>
      );
    }

    return null;
  };

  const columns: Array<GridColDef> = [
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
      align: 'left',
      renderCell: ({ row }: { row: IngestionFlowFile }) => {
        const loaded = row.correctlyImportedRows ?? '-';
        const discarded = row.discardedRows ?? '-';
        return <>{`${loaded}/${discarded}`}</>;
      }
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
      )
    },
    {
      field: 'menu',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: renderActionCell
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
            buttonText: t('commons.importFlow'),
            onActionClick: handleImportFlow
          }
        ]}
        description={description}
      />

      {isEmptyData ? (
        <EmptyDataGrid
          title={t('commons.noFlows')}
          action={{
            label: t('commons.importFlows'),
            onClick: handleImportFlow
          }}
        />
      ) : (
        <>
          <Grid
            container
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 2
            }}
          >
            <FilterContainer
              items={[
                {
                  type: COMPONENT_TYPE.textField,
                  label: t('commons.searchName'),
                  adornment: <Search />,
                  gridWidth: 5,
                  value: draftFilters.fileName || '',
                  onChange: (e) =>
                    updateDraftFilters({ fileName: e.target.value })
                },
                {
                  type: COMPONENT_TYPE.select,
                  label: t('commons.state'),
                  gridWidth: 2,
                  options: [
                    { label: t('commons.status.ALL'), value: 'ALL' },
                    ...Object.values(IngestionFlowFileStatus).map((status) => ({
                      label: t(`commons.status.${status}`),
                      value: status
                    }))
                  ],
                  value: draftFilters.status || 'ALL',
                  onChange: (e) => {
                    const value = e.target.value;
                    updateDraftFilters({
                      status:
                        value === 'ALL' ? undefined : (value as FlowStatus)
                    });
                  }
                },
                {
                  type: COMPONENT_TYPE.dateRange,
                  label: 'dateRange',
                  gridWidth: 4,
                  from: {
                    label: t('commons.exportFrom'),
                    errorMessage: t('dates.validations.from'),
                    value: draftFilters.creationDateFrom
                      ? new Date(draftFilters.creationDateFrom)
                      : null,
                    onChange: handleDateFromChange
                  },
                  to: {
                    label: t('dates.to'),
                    errorMessage: t('dates.validations.to'),
                    value: draftFilters.creationDateTo
                      ? new Date(draftFilters.creationDateTo)
                      : null,
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
                onPageChange: (page) =>
                  updatePagination({
                    page: page - 1,
                    size: appliedFilters.size
                  }),
                onPageSizeChange: (size) =>
                  updatePagination({
                    size,
                    page: appliedFilters.page
                  }),
                currentPage: urlPagination.pagination.currentPage
              }}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default ImportFlowOverview;
