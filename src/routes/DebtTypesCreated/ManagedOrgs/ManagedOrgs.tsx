import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { ArrowForwardIos } from '@mui/icons-material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';

type ManagedOrgData = {
  id: string;
  IPACode: string;
  managedOrg: string;
  debtTypesSet: number;
};

const mockData: Array<ManagedOrgData> = [
  {
    id: '1',
    IPACode: '00000',
    managedOrg: 'Azienda ULSS n.7 PEDEMONTANA',
    debtTypesSet: 50
  },
  {
    id: '2',
    IPACode: '00000',
    managedOrg: 'Città metropolitana di Venezia',
    debtTypesSet: 100
  },
  {
    id: '3',
    IPACode: '00000',
    managedOrg: 'Comune di Adria',
    debtTypesSet: 23
  },
  {
    id: '4',
    IPACode: '00000',
    managedOrg: 'Ente intermediato',
    debtTypesSet: 1000
  }
];

type ManagedOrgsProps = {
  IPACodeFilter: string;
};

export const ManagedOrgs = ({ IPACodeFilter }: ManagedOrgsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [data, setData] = useState<Array<ManagedOrgData>>([]);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  useEffect(() => {
    if (IPACodeFilter) {
      const filteredData = mockData.filter((item) =>
        item.IPACode.toLowerCase().includes(IPACodeFilter.toLowerCase())
      );
      setData(filteredData);
    } else {
      setData(mockData);
    }
  }, [IPACodeFilter, pagination, sortModel]);

  const updatePagination = (newPagination: Partial<typeof pagination>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
  };

  const columns: Array<GridColDef> = [
    {
      field: 'IPACode',
      headerName: t('debtTypesCreated.managedOrganizationsDataGrid.IPACode'),
      flex: 1,
      minWidth: 100
    },
    {
      field: 'managedOrg',
      headerName: t('debtTypesCreated.managedOrganizationsDataGrid.managedOrg'),
      flex: 2,
      minWidth: 200
    },
    {
      field: 'debtTypesSet',
      headerName: t(
        'debtTypesCreated.managedOrganizationsDataGrid.debtTypesSet'
      ),
      flex: 1,
      minWidth: 150
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <ArrowForwardIos
          fontSize="small"
          sx={{ color: theme.palette.primary.main, cursor: 'pointer' }}
          onClick={() => handleRowClick(params.row)}
        />
      )
    }
  ];

  const handleRowClick = (row: ManagedOrgData) => {
    //TODO: redirect to organization detail
    console.log('Organization:', row);
  };

  return (
    <Box sx={{ bgcolor: theme.palette.grey[200], padding: 2 }}>
      <CustomDataGrid
        rows={data}
        columns={columns}
        getRowId={(row) => row.id}
        disableColumnMenu
        disableColumnResize
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        customPagination={{
          totalPages: 1,
          defaultPageOption: pagination.size,
          sizePageOptions: [5, 10, 15, 20],
          onPageChange: (page) =>
            updatePagination({ page: page - 1, size: pagination.size }),
          onPageSizeChange: (size) => updatePagination({ size, page: 0 }),
          currentPage: pagination.page + 1
        }}
      />
    </Box>
  );
};

export default ManagedOrgs;
