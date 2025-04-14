import { Box, Stack, useTheme } from '@mui/material';
import { Downloading, Search } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import TitleComponent from '../../components/TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import { PageRoutes } from '../../App';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../../generated/apiClient';
import { downloadExportFile, getExportFiles } from '../../api/exportFiles';
import { useExportFlowFilters } from '../../hooks/useExportFlowFilters';
import { downloadBlob } from '../../utils/download';

const TelematicReceiptFlowExportOverview = () => {
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
  } = useExportFlowFilters({
    exportFileType: ExportFileTypeEnum.PAID
  });

  const { data, isLoading } = getExportFiles(organizationId, appliedFilters);

  const handleDownloadFile = async (exportFileId: number) => {
    const result = await downloadExportFile(organizationId, exportFileId);

    //TODO: handle error
    if (!result) {
      console.error('Failed to download file');
      return;
    }

    const { data, fileName } = result;
    downloadBlob(data, fileName);
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
        params.value ? new Date(params.value).toLocaleDateString('it-IT') : ''
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
        title={t('commons.routes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW')}
        callToAction={[
          {
            icon: <Downloading />,
            variant: 'outlined',
            buttonText: t(
              'telematicReceiptFlowExportOverview.buttonReservationExport'
            ),
            onActionClick: () =>
              navigate(
                generatePath(PageRoutes.EXPORT_FLOWS, { category: 'receipt' })
              )
          }
        ]}
        description={t('telematicReceiptFlowExportOverview.description')}
      />
      <Stack gap={3}>
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchName'),
              adornment: <Search />,
              gridWidth: 6,
              value: draftFilters.fileName || '',
              onChange: (e) => updateDraftFilters({ fileName: e.target.value })
            },
            {
              type: COMPONENT_TYPE.dateRange,
              label: 'dateRange',
              gridWidth: 5,
              from: {
                label: t('telematicReceiptFlowExportOverview.exportFrom'),
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
              onPageChange: (page) =>
                updatePagination({ page: page - 1, size: appliedFilters.size }),
              onPageSizeChange: (size) => updatePagination({ size, page: 0 }),
              currentPage: appliedFilters.page + 1
            }}
          />
        </Box>
      </Stack>
    </>
  );
};

export default TelematicReceiptFlowExportOverview;
