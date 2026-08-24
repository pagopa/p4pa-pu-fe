import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from 'react';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import ChipTruncateTooltip from '../../../components/ChipTruncateTooltip';

type DynamicFieldRow = {
  id: number;
  name: string;
  example: string;
  tag: string;
  tooltip?: string;
};

export type DynamicFieldsDataGridProps = {
  data: Array<DynamicFieldRow>;
};

const DynamicFieldsDataGrid = ({ data }: DynamicFieldsDataGridProps) => {
  const { t } = useTranslation();
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const columns: Array<GridColDef> = [
    {
      field: 'name',
      headerName: t('ioMessageGuide.table.name'),
      flex: 1,
      type: 'string',
      sortable: false,
      display: 'flex',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {params.row.name}
          </Typography>
          {params.row.tooltip && (
            <Tooltip title={params.row.tooltip} arrow>
              <InfoOutlinedIcon
                fontSize="small"
                color="primary"
                sx={{ cursor: 'help' }}
              />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      field: 'example',
      headerName: t('ioMessageGuide.table.example'),
      flex: 1,
      type: 'string',
      sortable: false,
      display: 'flex',
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            {params.row.example}
          </Typography>
        </Box>
      )
    },
    {
      field: 'tag',
      headerName: t('ioMessageGuide.table.tag'),
      flex: 1,
      type: 'string',
      sortable: false,
      display: 'flex',
      renderCell: (params: GridRenderCellParams) => (
        <ChipTruncateTooltip
          label={params.row.tag}
          tooltipLabel={params.row.tag}
        />
      )
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.5,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      display: 'flex',
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip
          title={
            copiedTag === params.row.tag
              ? t('ioMessageGuide.copied')
              : t('ioMessageGuide.copy')
          }
          arrow
        >
          <IconButton
            size="small"
            onClick={() => handleCopyTag(params.row.tag)}
            aria-label={t('ioMessageGuide.copyAriaLabel', {
              tag: params.row.tag
            })}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <CustomDataGrid
      rows={data}
      getRowId={(row) => row.id}
      columns={columns}
      disableColumnMenu
      disableColumnResize
      hideFooter
      totalPages={1}
    />
  );
};

export default DynamicFieldsDataGrid;
