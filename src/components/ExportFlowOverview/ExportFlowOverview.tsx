import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Downloading, Search } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import TitleComponent from '../TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../FilterContainer/FilterContainer';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { PageRoutes } from '../../routes';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../../generated/apiClient';
import { getExportFile, getExportFiles } from '../../api/exportFiles';
import { useExportFlowFilters } from '../../hooks/useExportFlowFilters';
import { downloadBlob } from '../../utils/download';
import EmptyDataGrid from '../EmptyDataGrid/EmptyDataGrid';
import { formatDateTime } from '../../utils/formatters';
import utils from '../../utils';
import { ReactNode, useEffect, useState } from 'react';

export type ExportFlowOverviewProps = {
  routingCategory: string;
  title: string;
  description?: string;
  sectionTitle?: string;
  exportFileTypes: ExportFileTypeEnum;
  specializedExportPage?: string;
  onExportClick?: () => void;
};

const ExportFlowOverview = ({
  routingCategory,
  title,
  description,
  sectionTitle,
  exportFileTypes,
  specializedExportPage,
  onExportClick
}: ExportFlowOverviewProps) => {
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
    handleDateFromChange,
    handleDateToChange,
    sortModel,
    handleSortModelChange,
    handlePaginationChange
  } = useExportFlowFilters({
    exportFileType: exportFileTypes
  });

  const { data, isLoading, isError } = getExportFiles(
    organizationId,
    appliedFilters
  );
  const isEmptyData = !data?.content || data.content.length === 0;

  useEffect(() => {
    if (isError) {
      setError(true);
    } else {
      setError(false);
    }
  }, [isError]);

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

  const defaultReservation = () =>
    navigate(
      generatePath(PageRoutes.EXPORT_FLOWS, { category: routingCategory })
    );

  const handleReservationClick =
    onExportClick ??
    (specializedExportPage
      ? () => navigate(specializedExportPage)
      : defaultReservation);

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

  const [error, setError] = useState<boolean>(false);
  const errorMessage: ReactNode = (
    <Typography
      variant="body2"
      color="error"
      mt={2}
      data-testid="explort-error-text"
    >
      {t('commons.filters.atLeastOneFilter')}
    </Typography>
  );

  return (
    <>
      <TitleComponent
        title={title}
        callToAction={[
          {
            icon: <Downloading />,
            variant: 'outlined',
            buttonText: t('exportFlow.buttonReservationExport'),
            onActionClick: handleReservationClick
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
        {error && errorMessage}
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
              onClick: applyFilters
            }
          ]}
        />

        <Box
          sx={{
            bgcolor: theme.palette.grey[200],
            padding: 2
          }}
        >
          {isEmptyData && data && data.totalElements === 0 ? (
            <EmptyDataGrid
              title={t('commons.noFlows')}
              action={{
                label: t('commons.exportFlows'),
                onClick: handleExportFlow
              }}
            />
          ) : (
            <CustomDataGrid
              rows={data?.content || []}
              columns={columns}
              getRowId={(row) => row.exportFileId}
              disableColumnMenu
              disableColumnResize
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              loading={isLoading}
              smartPagination={{
                initialPage: 0,
                initialSize: 10,
                sizeOptions: [5, 10, 20],
                backendData: {
                  totalElements: data?.totalElements || 0,
                  totalPages: data?.totalPages || 0,
                  number: data?.number || 0,
                  size: data?.size || 10
                },
                onPaginationChange: handlePaginationChange
              }}
            />
          )}
        </Box>
      </Stack>
    </>
  );
};

export default ExportFlowOverview;
