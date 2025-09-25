import { Search } from '@mui/icons-material';
import { Box, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import { getOrganizationsByBrokerIdAndFilters } from '../../api/organizations';
import utils from '../../utils';
import { useSearch } from '../../hooks/useSearch';
import { PagedOrganizationWithDebtPositionTypeOrgAndOperatorsCount } from '../../../generated/data-contracts';
import OrganizationsDatagrid from './components/OrganizationsDatagrid';
import { OrganizationsFilters } from '../../api/organizations/mappings';

export const Organizations = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const initialFilters: OrganizationsFilters = utils.URI.decode(
    window.location.hash
  );
  const [filterValues, setFilterValues] =
    useState<OrganizationsFilters>(initialFilters);

  const query = getOrganizationsByBrokerIdAndFilters();

  const organizations = useSearch({
    query,
    filters: filterValues
  });

  const onFilterChange = (updates: Partial<OrganizationsFilters>) => {
    setFilterValues((prev) => ({ ...prev, ...updates }));
  };

  const applyFilters = () => {
    organizations.applyFilters(filterValues);
  };

  return (
    <>
      <TitleComponent title={t('commons.routes.ORGANIZATIONS')} />
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
              label: t('commons.searchForOrganization'),
              value: filterValues.orgName || '',
              onChange: (e) => onFilterChange({ orgName: e.target.value }),
              adornment: <Search />,
              gridWidth: 10.5
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.search'),
              gridWidth: 1.5,
              onClick: applyFilters
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
        <OrganizationsDatagrid
          data={
            organizations.query
              ?.data as PagedOrganizationWithDebtPositionTypeOrgAndOperatorsCount
          }
        />
      </Box>
    </>
  );
};

export default Organizations;
