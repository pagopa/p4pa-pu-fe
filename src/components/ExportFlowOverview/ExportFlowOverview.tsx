import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Downloading, Search } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect } from 'react';
import TitleComponent from '../TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../FilterContainer/FilterContainer';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { PageRoutes } from '../../App';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../../generated/apiClient';
import { getExportFile, getExportFiles } from '../../api/exportFiles';
import { useExportFlowFilters } from '../../hooks/useExportFlowFilters';
import { useDataGridPaginationWithUrl } from '../../hooks/useDataGridPaginationWithUrl';
import { downloadBlob } from '../../utils/download';
import EmptyDataGrid from '../EmptyDataGrid/EmptyDataGrid';
import { formatDateTime } from '../../utils/formatters';
import utils from '../../utils';

export type ExportFlowOverviewProps = {
  routingCategory: string;
  title: string;
  description?: string;
  sectionTitle?: string;
  exportFileTypes: ExportFileTypeEnum;
};

const ExportFlowOverview = ({
  routingCategory,
  title,
  description,
  sectionTitle,
  exportFileTypes
}: ExportFlowOverviewProps) => {
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
  } = useExportFlowFilters({
    exportFileType: exportFileTypes
  });

  const { data: initialData } = getExportFiles(organizationId, baseFilters);

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
      urlPagination.handlePageChange(page + 1); // Convert to 1-based
    }
  };

  const applyFilters = () => {
    // Reset pagination when applying filters
    urlPagination.handlePageChange(1);
    baseApplyFilters();
  };

  // Second call with applied filters (including pagination)
  const { data, isLoading } = getExportFiles(organizationId, appliedFilters);
  const isEmptyData = !data?.content || data.content.length === 0;

  // Sincronizzazione paginazione con backend data
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

  const getFile = getExportFile(organizationId);

  const handleDownloadFile = async (exportFileId: number) => {
    try {
      const result = await getFile.mutateAsync(exportFileId);
      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('commons.files.downloadFailed'));
    }
  };

  const handleExportFlow = () => {
    navigate(
      generatePath(PageRoutes.EXPORT_FLOWS, {
        category: routingCategory
      })
    );
  };

  const renderActionCell = (params: GridRenderCellParams) => {
    const { exportFileId, status } = params.row;

    if (status === ExportFileStatus.COMPLETED) {
      return (
        <IconButton
          color="primary"
          size="small"
          onClick={() => handleDownloadFile(exportFileId)}
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
        formatDateTime(params.value as string)
    },
    {
      field: 'operator',
      headerName: t('flowDataGrid.operator'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'size',
      headerName: t('commons.files.size'),
      flex: 1,
      type: 'number',
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'menu',
      headerName: '',
      flex: 0.3,
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
            icon: <Downloading />,
            variant: 'outlined',
            buttonText: t('exportFlow.buttonReservationExport'),
            onActionClick: () =>
              navigate(
                generatePath(PageRoutes.EXPORT_FLOWS, {
                  category: routingCategory
                })
              )
          }
        ]}
        description={description}
      />
      <Stack gap={3}>
        {sectionTitle && (
          <Box mt={2}>
            <Typography variant="h4">{sectionTitle}</Typography>
          </Box>
        )}
        {isEmptyData ? (
          <EmptyDataGrid
            title={t('commons.noFlows')}
            action={{
              label: t('commons.exportFlows'),
              onClick: handleExportFlow
            }}
          />
        ) : (
          <>
            <FilterContainer
              items={[
                {
                  type: COMPONENT_TYPE.textField,
                  label: t('commons.searchName'),
                  adornment: <Search />,
                  gridWidth: 6,
                  value: draftFilters.fileName || '',
                  onChange: (e) =>
                    updateDraftFilters({ fileName: e.target.value })
                },
                {
                  type: COMPONENT_TYPE.dateRange,
                  label: 'dateRange',
                  gridWidth: 5,
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
            <Box
              sx={{
                bgcolor: theme.palette.grey[200],
                padding: 2
              }}
            >
              <CustomDataGrid
                rows={data?.content || []}
                columns={columns}
                getRowId={(row) => row.exportFileId}
                disableColumnMenu
                disableColumnResize
                sortModel={sortModel}
                onSortModelChange={handleSortModelChange}
                loading={isLoading}
                customPagination={{
                  totalPages: data?.totalPages || 1,
                  defaultPageOption: appliedFilters.size,
                  sizePageOptions: [5, 10, 15, 20],
                  onPageChange: (page) => {
                    return updatePagination({
                      page: page - 1,
                      size: appliedFilters.size
                    });
                  },
                  onPageSizeChange: (size) => {
                    return updatePagination({
                      size,
                      page: appliedFilters.page
                    });
                  },
                  currentPage: urlPagination.pagination.currentPage
                }}
              />
            </Box>
          </>
        )}
      </Stack>
    </>
  );
};

export default ExportFlowOverview;
