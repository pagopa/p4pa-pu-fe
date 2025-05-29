import { Add, Search } from '@mui/icons-material';
import { Box, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import DebtTypesDataGrid from './components/DebtTypesDataGrid';
import { getDebtPositionTypeWithCount } from '../../api/debtPositionsTypes';
import useDebtTypesFilters from '../../hooks/useDebtTypesFilters';
import { useDataGridPaginationWithUrl } from '../../hooks/useDataGridPaginationWithUrl';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PageRoutes } from '../../App';

type DebtTypesFilters = {
  description?: string;
};

export const DebtTypes = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const [filterValues, setFilterValues] = useState<DebtTypesFilters>({});
  const [draftFilters, setDraftFilters] = useState<DebtTypesFilters>({});

  const { handleSortModelChange, sortModel } = useDebtTypesFilters({
    initialFilters: {
      page: 0,
      size: 10
    }
  });

  const {
    pagination,
    handlePageChange,
    handlePageSizeChange,
    syncWithBackendData
  } = useDataGridPaginationWithUrl({
    initialPage: 0,
    initialSize: 10,
    totalElements: 0
  });

  const combinedFilters = {
    page: pagination.page,
    size: pagination.size,
    ...(filterValues.description && { description: filterValues.description })
  };

  const { data } = getDebtPositionTypeWithCount(
    organizationId,
    combinedFilters
  );

  useEffect(() => {
    if (data) {
      syncWithBackendData(data);
    }
  }, [data, syncWithBackendData]);

  const updateDraftFilters = useCallback(
    (updates: Partial<DebtTypesFilters>) => {
      setDraftFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    setFilterValues(draftFilters);
    handlePageChange(1);
  }, [draftFilters, handlePageChange]);

  const isSearchEnabled = draftFilters.description !== filterValues.description;

  return (
    <>
      <TitleComponent
        title={t('commons.routes.DEBT_TYPES_CATALOG')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('commons.createNewOne'),
            onActionClick: () => navigate(PageRoutes.DEBT_TYPE_CATALOG_CREATE)
          }
        ]}
        description={t('debtTypes.description')}
      />
      <Grid
        container
        direction="row"
        alignItems={'center'}
        justifyContent={'space-between'}
        my={2}
      >
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchForDescription'),
              value: draftFilters.description || '',
              onChange: (e) =>
                updateDraftFilters({ description: e.target.value }),
              adornment: <Search />,
              gridWidth: 10.5
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.search'),
              gridWidth: 1.5,
              onClick: applyFilters,
              disabled: !isSearchEnabled
            }
          ]}
        />
      </Grid>
      <Box
        sx={{
          bgcolor: theme.palette.grey[200],
          padding: 2
        }}
      >
        <DebtTypesDataGrid
          data={
            data || {
              content: [],
              size: 0,
              totalElements: 0,
              totalPages: 0,
              number: 0
            }
          }
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sortModel={sortModel}
          onSortChange={handleSortModelChange}
          pagination={{
            currentPage: pagination.page + 1,
            totalPages: data?.totalPages || 0,
            size: pagination.size
          }}
        />
      </Box>
    </>
  );
};

export default DebtTypes;
