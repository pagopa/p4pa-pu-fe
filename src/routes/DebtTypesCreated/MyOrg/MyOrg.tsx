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

type MyOrgData = {
  id: string;
  managedCode: string;
  debtType: string;
  description: string;
  lastUpdate: string;
  enabledOperators: number;
};

const mockData: Array<MyOrgData> = [
  {
    id: '1',
    managedCode: '00000',
    debtType: 'test 1',
    description: 'a',
    lastUpdate: '15/10/2024 12:42:09',
    enabledOperators: 50
  },
  {
    id: '2',
    managedCode: '00001',
    debtType: 'test 2',
    description: 'ab',
    lastUpdate: '15/10/2024 12:42:09',
    enabledOperators: 100
  },
  {
    id: '3',
    managedCode: '00002',
    debtType: 'test 3',
    description: 'abc',
    lastUpdate: '15/10/2024 12:42:09',
    enabledOperators: 23
  },
  {
    id: '4',
    managedCode: '00003',
    debtType: 'test 4',
    description: 'abcd',
    lastUpdate: '15/10/2024 12:42:09',
    enabledOperators: 1000
  }
];

type MyOrgProps = {
  codeFilter: string;
  descriptionFilter: string;
};

export const MyOrg = ({ codeFilter, descriptionFilter }: MyOrgProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [data, setData] = useState<Array<MyOrgData>>([]);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  useEffect(() => {
    let filteredData = [...mockData];

    if (codeFilter) {
      filteredData = filteredData.filter((item) =>
        item.managedCode.toLowerCase().includes(codeFilter.toLowerCase())
      );
    }

    if (descriptionFilter) {
      filteredData = filteredData.filter((item) =>
        item.description.toLowerCase().includes(descriptionFilter.toLowerCase())
      );
    }

    setData(filteredData);
  }, [codeFilter, descriptionFilter, pagination, sortModel]);

  const updatePagination = (newPagination: Partial<typeof pagination>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
  };

  const columns: Array<GridColDef> = [
    {
      field: 'managedCode',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.code'),
      flex: 1,
      minWidth: 100
    },
    {
      field: 'debtType',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.debtType'),
      flex: 1,
      minWidth: 100
    },
    {
      field: 'description',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.description'),
      flex: 1,
      minWidth: 200
    },
    {
      field: 'lastUpdate',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.lastUpdateDate'),
      flex: 1,
      minWidth: 150
    },
    {
      field: 'enabledOperators',
      headerName: t('debtTypesCreated.myOrganizationDataGrid.enabledOperators'),
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

  const handleRowClick = (row: MyOrgData) => {
    //TODO: redirect to organization detail
    console.log('DebtType:', row);
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

export default MyOrg;
