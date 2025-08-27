import { useState, useCallback } from 'react';
import { Add } from '@mui/icons-material';
import { Grid, Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import { ClientSilDataGrid } from './components/ClientSilDataGrid';
import { useStore } from '../../store/GlobalStore';
import { useSearch } from '../../hooks/useSearch';
import useClientSilFilters from '../../hooks/useClientSilFilters';
import clientSilApi from '../../api/clientSil';
import type { ClientSilFilters } from '../../api/clientSil/mappings';
import type {
  ClientDTOPage,
  ClientNoSecretDTO
} from '../../../generated/apiClient';
import { PageRoutes } from '../../routes';
import { useNavigate } from 'react-router';

/**
 * Main page for the management of Client SIL
 * Allows search, display and management of client SIL of the organization
 */
export const ClientSilPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { organizationId }
  } = useStore();

  const [filterValues, setFilterValues] = useState<ClientSilFilters>({
    clientName: '',
    clientId: ''
  });

  const clientSilQuery = clientSilApi.getClientSils({
    organizationId: Number(organizationId)
  });

  const clientSilSearch = useSearch<ClientSilFilters, ClientDTOPage>({
    filters: filterValues,
    query: clientSilQuery
  });

  const applyFilters = useCallback(() => {
    clientSilSearch.applyFilters(filterValues);
  }, [clientSilSearch, filterValues]);

  const { filters: filterItems } = useClientSilFilters({
    onFilter: applyFilters
  });

  const handleFilterChange = useCallback((id: string, value: unknown) => {
    setFilterValues((prev) => ({
      ...prev,
      [id]: value as string
    }));
  }, []);

  const handleAddNew = useCallback(() => {
    navigate(PageRoutes.CLIENT_SIL_CREATE);
  }, [navigate]);

  const handleRowClick = useCallback((row: ClientNoSecretDTO) => {
    // TODO: Implement navigation to client detail
    console.log(`Navigate to client detail: ${row.clientId}`);
  }, []);

  return (
    <Stack gap={5}>
      <TitleComponent
        title={t('commons.routes.CLIENT_SIL')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('clientSil.addNew'),
            onActionClick: handleAddNew
          }
        ]}
      />
      <FilterContainer
        items={filterItems}
        values={filterValues}
        onChange={handleFilterChange}
      />
      <Grid
        container
        p={2}
        height="100%"
        sx={{ bgcolor: theme.palette.grey[200], overflow: 'auto' }}
        aria-label="client-sil-table"
      >
        <ClientSilDataGrid
          data={clientSilSearch.query.data}
          loading={clientSilSearch.query.isPending}
          onRowClick={handleRowClick}
        />
      </Grid>
    </Stack>
  );
};

export default ClientSilPage;
