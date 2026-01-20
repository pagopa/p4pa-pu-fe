import { Add, Search } from '@mui/icons-material';
import { Box, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import DebtTypesDataGrid from './components/DebtTypesDataGrid';
import { getDebtPositionTypeWithCount } from '../../api/debtPositionsTypes';
import { useStore } from '../../store/GlobalStore';
import { PageRoutes } from '../../routes';
import utils from '../../utils';
import { useSearch } from '../../hooks/useSearch';
import { PagedDebtPositionTypeWithCount } from '../../../generated/data-contracts';

type DebtTypesFilters = {
  code?: string;
  description?: string;
};

export const DebtTypes = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    state: { organizationId }
  } = useStore();

  const initialFilters: DebtTypesFilters = utils.URI.decode(
    window.location.hash
  );
  const [filterValues, setFilterValues] =
    useState<DebtTypesFilters>(initialFilters);

  const query = getDebtPositionTypeWithCount({ organizationId });

  const debtPositionTypes = useSearch({
    query,
    filters: filterValues
  });

  const onFilterChange = (updates: Partial<DebtTypesFilters>) => {
    setFilterValues((prev) => ({ ...prev, ...updates }));
  };

  const applyFilters = () => {
    debtPositionTypes.applyFilters(filterValues);
  };

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
              id: 'code',
              label: t('commons.searchForCode'),
              onChange: (e) => onFilterChange({ code: e.target.value }),
              adornment: <Search />,
              value: filterValues.code || '',
              gridWidth: 3.5
            },
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchForDescription'),
              value: filterValues.description || '',
              onChange: (e) => onFilterChange({ description: e.target.value }),
              adornment: <Search />,
              gridWidth: 7
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.search'),
              gridWidth: 1.5
            }
          ]}
          onSubmit={applyFilters}
        />
      </Grid>
      <Box
        sx={{
          bgcolor: theme.palette.grey[200],
          padding: 2
        }}
      >
        <DebtTypesDataGrid
          data={debtPositionTypes.query?.data as PagedDebtPositionTypeWithCount}
        />
      </Box>
    </>
  );
};

export default DebtTypes;
