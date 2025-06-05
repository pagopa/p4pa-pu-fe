import { Add, Search } from '@mui/icons-material';
import { Box, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import DebtTypesDataGrid from './components/DebtTypesDataGrid';
import { getDebtPositionTypeWithCount } from '../../api/debtPositionsTypes';
import useDebtTypesFilters from '../../hooks/useDebtTypesFilters';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PageRoutes } from '../../routes';

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
  const [paginationParams, setPaginationParams] = useState({
    page: 0,
    size: 10
  });

  const { handleSortModelChange, sortModel } = useDebtTypesFilters({
    initialFilters: {
      page: paginationParams.page,
      size: paginationParams.size
    }
  });

  const combinedFilters = {
    page: paginationParams.page,
    size: paginationParams.size,
    ...(filterValues.description && { description: filterValues.description })
  };

  const { data } = getDebtPositionTypeWithCount(
    organizationId,
    combinedFilters
  );

  const handlePaginationChange = (pagination: {
    page: number;
    size: number;
  }) => {
    setPaginationParams(pagination);
  };

  const handleFiltersApplied = () => {
    setFilterValues(draftFilters);
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  };

  const updateDraftFilters = useCallback(
    (updates: Partial<DebtTypesFilters>) => {
      setDraftFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    handleFiltersApplied();
  }, [draftFilters]);

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
          sortModel={sortModel}
          onSortChange={handleSortModelChange}
          onFiltersApplied={handleFiltersApplied}
          onPaginationChange={handlePaginationChange}
        />
      </Box>
    </>
  );
};

export default DebtTypes;
