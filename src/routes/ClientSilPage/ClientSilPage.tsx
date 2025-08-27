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
import { useConfirmDialog } from '../DebtTypeDetailView/hooks/useConfirmDialog';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import utils from '../../utils';

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

  const { isOpen, currentAction, closeDialog, handleConfirm, showDialog } =
    useConfirmDialog();

  // Custom delete dialog for Client SIL with specific translations
  const showClientSilDeleteDialog = useCallback(
    (onConfirm: () => void | Promise<void>) => {
      showDialog({
        title: t('clientSil.delete.confirmDialog.title'),
        message: t('clientSil.delete.confirmDialog.description'),
        confirmLabel: t('commons.delete'),
        onConfirm,
        variant: 'error',
        testId: 'confirm-delete-client-sil-dialog'
      });
    },
    [showDialog, t]
  );

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

  // Create delete mutation hook - must be called at component level
  const deleteClientMutation = clientSilApi.deleteClientSil(
    Number(organizationId)
  );

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

  /**
   * Temporary handle for row click - currently triggers delete dialog
   * TODO: Replace with navigation to detail page when implemented
   */
  const handleRowClick = useCallback(
    (row: ClientNoSecretDTO) => {
      showClientSilDeleteDialog(async () => {
        try {
          await deleteClientMutation.mutateAsync(row.clientId!);
          navigate(PageRoutes.CLIENT_SIL_INDEX);
        } catch (error: unknown) {
          console.error('Error while deleting the client:', error);

          const isAxiosErrorWithResponse = (
            err: unknown
          ): err is { response?: { status?: number } } => {
            return typeof err === 'object' && err !== null && 'response' in err;
          };

          const statusCode = isAxiosErrorWithResponse(error)
            ? error.response?.status
            : undefined;

          if (statusCode && statusCode >= 400 && statusCode < 500) {
            navigate(PageRoutes.RESPONSES_ERROR, {
              state: {
                category: 'client-sil-delete',
                errorType: '4xx',
                statusCode
              }
            });
            return;
          }
          // For 5xx errors or other errors, show generic notification and stay on page
          utils.notify.emit(t('errors.generic'), 'error');
        }
      });
    },
    [
      organizationId,
      navigate,
      showClientSilDeleteDialog,
      deleteClientMutation,
      t
    ]
  );

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

      {/* Confirmation Dialog */}
      <GenericDialog
        open={isOpen}
        title={currentAction?.title || ''}
        message={currentAction?.message}
        confirmLabel={currentAction?.confirmLabel}
        cancelLabel={currentAction?.cancelLabel}
        onConfirm={handleConfirm}
        onClose={closeDialog}
        data-testid={currentAction?.testId}
      />
    </Stack>
  );
};

export default ClientSilPage;
