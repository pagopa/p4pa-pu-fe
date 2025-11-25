import { Box, IconButton, Stack, useTheme } from '@mui/material';
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
  BaseFilterValues,
  DOWNLOAD_STATES,
  FlowStatus,
  MENU_STATES,
  STATE_COLORS
} from '../../models/Filters';
import {
  getIngestionFlowFile,
  getIngestionFlowFileError,
  getIngestionFlowFileIuv,
  getIngestionFlowFileNotice,
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
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { FlowFilesFilters } from '../../api/ingestionFlowFiles/mappings';
import { PagedIngestionFlowFile } from '../../../generated/data-contracts';

export type ImportFlowOverviewProps = {
  routingCategory: string;
  title: string;
  accessibleTitle?: string;
  description?: string;
  ingestionFlowFileTypes: Array<IngestionFlowFileTypeEnum>;
};

const ImportFlowOverview = ({
  routingCategory,
  title,
  accessibleTitle,
  description,
  ingestionFlowFileTypes
}: ImportFlowOverviewProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    state: { organizationId }
  } = useStore();

  const defaultDateRange = utils.formatters.getDefaultDateRange();
  const initialFilters = utils.URI.decode(window.location.hash);

  const [error, setError] = useState<boolean>(false);
  const [filters, setFilters] = useState<FlowFilesFilters>({
    dateRange: defaultDateRange,
    ...initialFilters,
    ingestionFlowFileTypes
  });

  const query = getIngestionFlowFiles(organizationId, routingCategory);

  const flowFilters = useSearch<FlowFilesFilters, PagedIngestionFlowFile>({
    filters,
    query
  });

  const isEmptyData = !query.data?.content?.length;

  const getIngestionFlowFileErrorMutation =
    getIngestionFlowFileError(organizationId);

  const getIngestionFlowFileMutation = getIngestionFlowFile(organizationId);

  const getIngestionFlowFileIuvMutation =
    getIngestionFlowFileIuv(organizationId);

  const getIngestionFlowFileNoticeMutation =
    getIngestionFlowFileNotice(organizationId);

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

  const handleDownloadIuvFile = async (ingestionFlowFileId: number) => {
    try {
      const { data, fileName } =
        await getIngestionFlowFileIuvMutation.mutateAsync(ingestionFlowFileId);
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('FileUploaderFlowImport.error.errorFlowFile'));
    }
  };

  const handleDownloadNoticeFile = async (ingestionFlowFileId: number) => {
    try {
      const { data, fileName } =
        await getIngestionFlowFileNoticeMutation.mutateAsync(
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

  /**
   * Checks if the export CTAs (IUV and ZIP avvisi) should be shown.
   * The CTAs are available only for DP_INSTALLMENTS flows and are shown if:
   * - The status is COMPLETED (ELABORATO), or
   * - The status is WARNING (ELABORATO CON ERRORI) and the correctly imported rows count is greater than 0
   *
   * @param status - The status of the import flow
   * @param correctlyImportedRows - The number of correctly imported rows (optional)
   * @returns true if the CTAs should be shown, false otherwise
   */
  const shouldShowExportCTAs = (
    status: string,
    correctlyImportedRows?: number
  ): boolean => {
    // The CTAs are available only for DP_INSTALLMENTS flows
    const isDebtPositionsFlow = ingestionFlowFileTypes.includes(
      IngestionFlowFileTypeEnum.DP_INSTALLMENTS
    );

    if (!isDebtPositionsFlow) {
      return false;
    }

    if (status === 'COMPLETED') {
      return true;
    }

    if (status === 'WARNING') {
      return (correctlyImportedRows ?? 0) > 0;
    }

    return false;
  };

  const renderActionCell = (params: GridRenderCellParams) => {
    const {
      ingestionFlowFileId,
      status,
      discardFileName,
      correctlyImportedRows
    } = params.row;

    if (MENU_STATES.includes(status)) {
      const menuItems = [
        {
          icon: <DownloadIcon fontSize="small" color="primary" />,
          label: t('commons.files.imported'),
          action: () => handleDownloadFile(ingestionFlowFileId)
        }
      ];

      const shouldShowImportResult =
        status === 'COMPLETED' ||
        (discardFileName !== undefined && discardFileName !== null);

      if (shouldShowImportResult) {
        menuItems.push({
          icon: <DownloadIcon fontSize="small" color="primary" />,
          label: t('commons.files.importedResult'),
          action: () => handleDownloadFileError(ingestionFlowFileId)
        });
      }

      // Add the export CTAs (IUV and ZIP avvisi) if the conditions are met
      if (shouldShowExportCTAs(status, correctlyImportedRows)) {
        menuItems.push({
          icon: <DownloadIcon fontSize="small" color="primary" />,
          label: t('commons.files.importedIuv'),
          action: () => handleDownloadIuvFile(ingestionFlowFileId)
        });

        menuItems.push({
          icon: <DownloadIcon fontSize="small" color="primary" />,
          label: t('commons.files.importedNotice'),
          action: () => handleDownloadNoticeFile(ingestionFlowFileId)
        });
      }

      return <ActionMenu rowId={ingestionFlowFileId} menuItems={menuItems} />;
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

  const applyFilters = () => {
    const rawFilters = {
      ...filters,
      ingestionFlowFileTypes: null
    };
    if (noFilterSetted(rawFilters)) {
      setError(shouldShowGeneralError(rawFilters));
    } else {
      setError(false);
      flowFilters.applyFilters(filters);
    }
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

  const items = [
    {
      type: COMPONENT_TYPE.textField,
      label: t('commons.searchName'),
      id: 'fileName',
      adornment: <Search />,
      gridWidth: 5
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
      id: 'status'
    },
    {
      type: COMPONENT_TYPE.dateRange,
      label: 'dateRange',
      id: 'dateRange',
      gridWidth: 4,
      from: {
        label: t('commons.importFrom'),
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
            icon: <Upload />,
            variant: 'outlined',
            buttonText: t('commons.importFlow'),
            onActionClick: handleImportFlow
          }
        ]}
        description={description}
        accessibleTitle={accessibleTitle}
      />

      <Stack gap={3}>
        {error && <ErrorMessage variant="outlined" />}
        <FilterContainer
          items={items}
          values={filters as BaseFilterValues}
          onChange={(id, value) =>
            setFilters((filters) => ({
              ...filters,
              [id]: value
            }))
          }
          onSubmit={applyFilters}
        />

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
              totalPages={query.data?.totalPages || 1}
            />
          )}
        </Box>
      </Stack>
    </>
  );
};

export default ImportFlowOverview;
