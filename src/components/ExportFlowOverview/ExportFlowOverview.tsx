import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Downloading, Search } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
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
} from '../../../generated/core/client';
import { getExportFile, getExportFiles } from '../../api/exportFiles';
import { downloadBlob } from '../../utils/download';
import EmptyDataGrid from '../EmptyDataGrid/EmptyDataGrid';
import { formatDateTime, formatFileSize } from '../../utils/formatters';
import utils from '../../utils';
import { useEffect, useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { PagedExportFile } from '../../../generated/core/data-contracts';
import { ExportFilesFilters } from '../../api/exportFiles/mapping';

export type ExportFlowOverviewProps = {
  routingCategory: string;
  title: string;
  description?: string;
  accessibleTitle?: string;
  sectionTitle?: string;
  exportFileTypes: ExportFileTypeEnum;
  specializedExportPage?: string;
  onExportClick?: () => void;
};

const ExportFlowOverview = ({
  routingCategory,
  title,
  description,
  accessibleTitle,
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
  const defaultDateRange = utils.formatters.getDefaultDateRange();

  const initialFilters = utils.URI.decode(window.location.hash);

  const [error, setError] = useState<boolean>(false);
  const [filters, setFilters] = useState<ExportFilesFilters>({
    dateRange: defaultDateRange,
    ...initialFilters,
    exportFileType: exportFileTypes
  });

  const query = getExportFiles(organizationId, routingCategory);

  const exportFilters = useSearch<ExportFilesFilters, PagedExportFile>({
    filters,
    query
  });

  const { data, isError } = exportFilters.query;
  const isEmptyData = !data?.content.length;

  // Apply filters with client-side validation
  // Check if at least one filter is set before applyings
  const handleApplyFilters = () => {
    // Check if at least the file name or the date range are set
    const hasFileName = filters.fileName && filters.fileName.trim() !== '';
    const hasDateRange = filters.dateRange?.from && filters.dateRange?.to;

    if (hasFileName || hasDateRange) {
      setError(false);
      exportFilters.applyFilters(filters);
    } else {
      setError(true);
    }
  };

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
          aria-label={t('commons.files.downloadFlow')}
          size="small"
          onClick={() => handleDownloadFile(exportFileId)}
          data-testid="download-button"
        >
          <DownloadIcon />
        </IconButton>
      );
    }

    return <div aria-label={t('commons.files.notFound')} />;
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
      field: 'fileSize',
      headerName: t('commons.files.size'),
      flex: 1,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      renderCell: (params: GridRenderCellParams) =>
        formatFileSize(params.value as number)
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

  const items = [
    {
      type: COMPONENT_TYPE.textField,
      label: t('commons.searchName'),
      id: 'fileName',
      adornment: <Search />,
      gridWidth: 6
    },
    {
      type: COMPONENT_TYPE.dateRange,
      label: 'dateRange',
      id: 'dateRange',
      gridWidth: 5,
      from: {
        label: t('commons.exportFrom'),
        errorMessage: t('dates.validations.from')
      },
      to: {
        label: t('dates.to'),
        errorMessage: t('dates.validations.to')
      }
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 1
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
            onActionClick: handleReservationClick
          }
        ]}
        description={description}
        accessibleTitle={accessibleTitle}
      />
      <Stack gap={3}>
        {sectionTitle && (
          <Box mt={2}>
            <Typography variant="h4">{sectionTitle}</Typography>
          </Box>
        )}
        {error && (
          <ErrorMessage variant="outlined" testId="multifilters-error-text" />
        )}
        <FilterContainer
          items={items}
          values={filters}
          onChange={(id, value) =>
            setFilters((filters) => ({
              ...filters,
              [id]: value
            }))
          }
          onSubmit={handleApplyFilters}
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
              totalPages={data?.totalPages || 1}
            />
          )}
        </Box>
      </Stack>
    </>
  );
};

export default ExportFlowOverview;
