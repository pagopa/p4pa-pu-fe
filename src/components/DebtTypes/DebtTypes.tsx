import { Add, Search } from '@mui/icons-material';
import { Box, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TitleComponent from '../TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../FilterContainer/FilterContainer';
import DebtTypesDataGrid from './DebtTypesDataGrid';
import { getDebtPositionTypeWithCount } from '../../api/debtPositionsTypes';
import useDebtTypesFilters from '../../hooks/useDebtTypesFilters';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

export const DebtTypes = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get('page') || '1') - 1;
  const sizeFromUrl = parseInt(searchParams.get('size') || '10');

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const {
    appliedFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    handleSortModelChange,
    sortModel,
    isSearchEnabled
  } = useDebtTypesFilters({
    initialFilters: {
      page: pageFromUrl,
      size: sizeFromUrl
    },
    onFiltersChange: (filters) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', (filters.page + 1).toString());
      params.set('size', filters.size.toString());
      setSearchParams(params, { replace: true });
    }
  });

  const { data, isLoading } = getDebtPositionTypeWithCount(organizationId, {
    page: appliedFilters.page,
    size: appliedFilters.size,
    sort: appliedFilters.sort,
    ...(appliedFilters.description && {
      description: appliedFilters.description
    })
  });

  return (
    <>
      <TitleComponent
        title={t('commons.routes.DEBT_TYPES_CATALOG')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('commons.createNew'),
            onActionClick: () => navigate('/debt-types/new')
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
              label: t('debtTypes.searchDescription'),
              value: draftFilters.description || '',
              onChange: (e) =>
                updateDraftFilters({ description: e.target.value }),
              icon: <Search />,
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
          onPageChange={(page) =>
            updatePagination({ page: page - 1, size: appliedFilters.size })
          }
          onPageSizeChange={(size) => updatePagination({ size, page: 0 })}
          sortModel={sortModel}
          onSortChange={handleSortModelChange}
          pagination={{
            currentPage: appliedFilters.page + 1,
            totalPages: data?.totalPages || 0,
            size: appliedFilters.size
          }}
          isLoading={isLoading}
        />
      </Box>
    </>
  );
};

export default DebtTypes;
