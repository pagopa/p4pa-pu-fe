import React from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  OrgSilServiceType,
  OrgSilServiceView,
  PagedOrgSilServiceView
} from '../../../../generated/apiClient';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';

type ServiceDataGridProps = {
  data?: PagedOrgSilServiceView;
  loading: boolean;
  onPaginationChange: (pagination: { page: number; size: number }) => void;
  onRowClick: (row: OrgSilServiceView) => void;
};

export const ServiceDataGrid: React.FC<ServiceDataGridProps> = ({
  data,
  onPaginationChange,
  onRowClick
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const columns: Array<GridColDef> = [
    {
      field: 'applicationName',
      headerName: t('orgSilService.api'),
      flex: 1,
      minWidth: 200
    },
    {
      field: 'serviceType',
      headerName: t('orgSilService.serviceType'),
      flex: 1,
      minWidth: 200,
      sortable: false,
      valueGetter: (value) => {
        switch (value) {
          case OrgSilServiceType.PAID_NOTIFICATION_OUTCOME:
            return t('orgSilService.paymentNotice');
          case OrgSilServiceType.ACTUALIZATION:
            return t('orgSilService.amountActualization');
          default:
            return value;
        }
      }
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.5,
      width: 50,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<OrgSilServiceView>) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => onRowClick(params.row)}
        >
          <ChevronRight />
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
      <CustomDataGrid
        rows={data?.content || []}
        columns={columns}
        getRowId={(row: OrgSilServiceView) =>
          row.orgSilServiceId?.toString() || ''
        }
        disableColumnMenu
        disableColumnResize
        smartPagination={{
          initialPage: 0,
          initialSize: 10,
          sizeOptions: [5, 10, 20],
          backendData: {
            totalElements: data?.totalElements,
            totalPages: data?.totalPages,
            number: data?.number,
            size: data?.size
          },
          onPaginationChange
        }}
      />
    </Box>
  );
};
