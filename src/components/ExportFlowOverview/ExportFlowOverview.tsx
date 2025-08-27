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
} from '../../../generated/apiClient';
import { getExportFile, getExportFiles } from '../../api/exportFiles';
import { downloadBlob } from '../../utils/download';
import EmptyDataGrid from '../EmptyDataGrid/EmptyDataGrid';
import { formatDateTime, formatFileSize } from '../../utils/formatters';
import utils from '../../utils';
import { ReactNode, useEffect, useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { FieldValues } from 'react-hook-form';
import { ExportFileFilters } from '../../models/Filters';

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

  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);

  const defaultDateRange = utils.formatters.getDefaultDateRange();
  const [filters, setFilters] = useState<ExportFileFilters>({
    creationDateFrom: defaultDateRange.from,
    creationDateTo: defaultDateRange.to,
    page: 0,
    size: 10,
    ...initialFilters,
    exportFileType: exportFileTypes
  });

  const query = getExportFiles(organizationId, routingCategory);

  const exportFilters = useSearch({
    filters,
    query
  });

  const { data, isError } = exportFilters.query;
  const isEmptyData = !data?.content.length;

  const updateFilterValue = (key: string, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
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
              value: filters.fileName || '',
              onChange: (e) => updateFilterValue('fileName', e.target.value)
            },
            {
              type: COMPONENT_TYPE.dateRange,
              label: 'dateRange',
              gridWidth: 5,
              from: {
                label: t('commons.exportFrom'),
                errorMessage: t('dates.validations.from'),
                value: filters.creationDateFrom
                  ? new Date(filters.creationDateFrom)
                  : null,
                onChange: (value) =>
                  updateFilterValue(
                    'creationDateFrom',
                    value ? new Date(value).toISOString() : undefined
                  )
              },
              to: {
                label: t('dates.to'),
                errorMessage: t('dates.validations.to'),
                value: filters.creationDateTo
                  ? new Date(filters.creationDateTo)
                  : null,
                onChange: (value) =>
                  updateFilterValue(
                    'creationDateTo',
                    value ? new Date(value).toISOString() : undefined
                  )
              }
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.filters.filterResults'),
              gridWidth: 1,
              onClick: () => exportFilters.applyFilters(filters)
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
              totalPages={data?.totalPages || 1}
            />
          )}
        </Box>
      </Stack>
    </>
  );
};

export default ExportFlowOverview;
