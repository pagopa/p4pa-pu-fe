import { Add, Search } from '@mui/icons-material';
import { Box, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useStore } from '../../../store/GlobalStore';
import utils from '../../../utils';
import spontaneousForm from '../../../api/spontaneousForm';
import { useSearch } from '../../../hooks/useSearch';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../../components/FilterContainer/FilterContainer';
import { PagedSpontaneousForm } from '../../../../generated/data-contracts';
import SpontaneousFormDataGrid from './components/SpontaneousFormDataGrid';
import { PageRoutes } from '../..';
import { useNavigate } from 'react-router';

type SpontaneousFormFilters = {
  code?: string;
};

export const SpontaneousFormPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    state: { organizationId }
  } = useStore();

  const initialFilters: SpontaneousFormFilters = utils.URI.decode(
    window.location.hash
  );
  const [filterValues, setFilterValues] =
    useState<SpontaneousFormFilters>(initialFilters);

  const query = spontaneousForm.getSpontaneousForms({
    organizationId: Number(organizationId)
  });

  const spontaneousForms = useSearch({
    query,
    filters: filterValues
  });

  const onFilterChange = (updates: Partial<SpontaneousFormFilters>) => {
    setFilterValues((prev) => ({ ...prev, ...updates }));
  };

  const applyFilters = () => {
    spontaneousForms.applyFilters(filterValues);
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.SPONTANEOUS_FORM')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('commons.createNewOne'),
            onActionClick: () => navigate(PageRoutes.SPONTANEOUS_FORM_CREATE)
          }
        ]}
        description={t('spontaneousForm.description')}
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
              label: t('spontaneousForm.searchByCode'),
              value: filterValues.code || '',
              onChange: (e) => onFilterChange({ code: e.target.value }),
              adornment: <Search />,
              gridWidth: 10.5
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
        <SpontaneousFormDataGrid
          data={spontaneousForms.query?.data as PagedSpontaneousForm}
        />
      </Box>
    </>
  );
};

export default SpontaneousFormPage;
