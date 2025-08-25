import { Box, Grid, IconButton, useTheme } from '@mui/material';
import { Search, Upload } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import FilterContainer, {
  COMPONENT_TYPE
} from '../FilterContainer/FilterContainer';
import ActionMenu from '../ActionMenu/ActionMenu';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import {
  DOWNLOAD_STATES,
  FlowFileFilters,
  FlowStatus,
  MENU_STATES,
  STATE_COLORS
} from '../../models/Filters';
import {
  getIngestionFlowFile,
  getIngestionFlowFileError,
  getIngestionFlowFiles
} from '../../api/ingestionFlowFiles';
import {
  IngestionFlowFile,
  IngestionFlowFileStatus,
  IngestionFlowFileTypeEnum
} from '../../../generated/apiClient';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';
import EmptyDataGrid from '../EmptyDataGrid/EmptyDataGrid';
import { useStore } from '../../store/GlobalStore';
import ChipTruncateTooltip from '../ChipTruncateTooltip';
import { useSearch } from '../../hooks/useSearch';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';

const getDefaultDateRange = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return {
    creationDateFrom: new Date(oneYearAgo.setHours(0, 0, 0, 0)).toISOString(),
    creationDateTo: new Date(today.setHours(23, 59, 59, 999)).toISOString()
  };
};

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

  const {
    state: { organizationId }
  } = useStore();

  const defaultDateRange = getDefaultDateRange();

  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);
  const [filters, setFilters] = useState<FlowFileFilters>({
    creationDateFrom: new Date(defaultDateRange.creationDateFrom),
    creationDateTo: new Date(defaultDateRange.creationDateTo),
    page: 0,
    size: 10,
    ...initialFilters,
    ingestionFlowFileTypes
  });

  const query = getIngestionFlowFiles(organizationId, routingCategory);

  const flowFilters = useSearch({
    filters,
    query
  });

  const isEmptyData = !query.data?.content?.length;

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
      flex: 0.75,
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
      flex: 1,
      type: 'string',
      valueFormatter: ({ value }) => t(`commons.status.${value}`, value),
      renderCell: (params) => (
        <ChipTruncateTooltip
          label={t(`commons.status.${params.value}`)}
          color={STATE_COLORS[params.value as FlowStatus] || 'default'}
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
              value: filters.fileName || '',
              onChange: (e) =>
                setFilters((prev) => ({ ...prev, fileName: e.target.value }))
            },
            {
              type: COMPONENT_TYPE.select,
              label: t('commons.state'),
              gridWidth: 2,
              options: [
                ...Object.values(IngestionFlowFileStatus).map((status) => ({
                  label: t(`commons.status.${status}`),
                  value: status
                }))
              ],
              value: filters.status,
              onChange: (e) => {
                const value = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  status: value as IngestionFlowFileStatus
                }));
              }
            },
            {
              type: COMPONENT_TYPE.dateRange,
              label: 'dateRange',
              gridWidth: 4,
              from: {
                label: t('commons.exportFrom'),
                errorMessage: t('dates.validations.from'),
                value: filters.creationDateFrom
                  ? new Date(filters.creationDateFrom)
                  : null,
                onChange: (value) =>
                  setFilters((prev) => ({
                    ...prev,
                    creationDateFrom: value
                      ? new Date(value)
                      : undefined
                  }))
              },
              to: {
                label: t('dates.to'),
                errorMessage: t('dates.validations.to'),
                value: filters.creationDateTo
                  ? new Date(filters.creationDateTo)
                  : null,
                onChange: (value) =>
                  setFilters((prev) => ({
                    ...prev,
                    creationDateTo: value
                      ? new Date(value)
                      : undefined
                  }))
              }
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.filters.filterResults'),
              gridWidth: 1,
              onClick: () => flowFilters.applyFilters(filters)
            }
          ]}
        />
      </Grid>

      <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
        {isEmptyData && query.data && query.data.totalElements === 0 ? (
          <EmptyDataGrid
            title={t('commons.noFlows')}
            action={{
              label: t('commons.importFlows'),
              onClick: handleImportFlow
            }}
          />
        ) : (
          <CustomDataGrid
            rows={query.data?.content || []}
            columns={columns}
            getRowId={(row) => row.ingestionFlowFileId}
            disableColumnMenu
            disableColumnResize
            loading={query.isPending}
            totalPages={query.data?.totalPages || 1}
          />
        )}
      </Box>
    </>
  );
};

export default ImportFlowOverview;
