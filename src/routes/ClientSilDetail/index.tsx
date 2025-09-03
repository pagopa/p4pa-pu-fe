import { Box, Button, Stack } from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DetailAccordion from '../../components/DetailAccordion/DetailAccordion';
import { DetailSectionProps } from '../../components/DetailContainer/DetailContainer';
import { useStore } from '../../store/GlobalStore';
import { useNavigate, useParams } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { ClientDTO } from '../../../generated/data-contracts';
import { getClientDetail } from '../../api/clientSil';
import { PageRoutes } from '..';
import ClientSecret from './ClientSecret';
import clientSilApi from '../../api/clientSil';
import utils from '../../utils';

function truncTitle(str: string, maxLength = 30) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + '...';
  }
  return str;
}

const ClientSilDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const {
    state: { organizationId }
  } = useStore();

  const [clientItem, setClientItem] = useState<ClientDTO | null>(null);

  if (!clientId) {
    navigate(PageRoutes.RESPONSES_ERROR);
    return null;
  }

  const query = getClientDetail(organizationId, clientId);

  const { isPending, isError, error, data } = query;

  // Create delete mutation hook
  const deleteClientMutation = clientSilApi.deleteClientSil(
    Number(organizationId)
  );

  useEffect(() => {
    if (isError && error) {
      console.error('Error loading client details:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [isError, error, navigate]);

  useEffect(() => {
    if (data && !clientItem) {
      setClientItem(data);
    }
  }, [data, clientItem]);

  const showDeleteDialog = () => {
    utils.dialog.open({
      title: t('clientSil.delete.confirmDialog.title'),
      message: t('clientSil.delete.confirmDialog.description'),
      confirmLabel: t('commons.delete'),
      cancelLabel: t('commons.cancel'),
      onConfirm: handleDeleteConfirm,
      onClose: () => utils.dialog.close(),
      'data-testid': 'confirm-delete-client-sil-dialog'
    });
  };

  /**
   * Handle delete action for Client SIL
   */
  const handleDelete = useCallback(() => {
    if (!clientId) return;
    showDeleteDialog();
  }, [clientId]);

  const handleDeleteConfirm = async () => {
    if (!clientId) return;

    try {
      await deleteClientMutation.mutateAsync(clientId);
      utils.dialog.close();
      navigate(PageRoutes.CLIENT_SIL_INDEX);
    } catch (error: unknown) {
      utils.dialog.close();
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
      utils.notify.emit(t('errors.generic'), 'error');
    }
  };

  const actionButtons = [
    {
      icon: <Delete />,
      buttonText: t('commons.delete'),
      color: 'error' as const,
      variant: 'outlined' as const,
      onActionClick: handleDelete
    },
    {
      icon: <Edit />,
      buttonText: t('commons.edit'),
      color: 'primary' as const,
      variant: 'contained' as const,
      onActionClick: () => console.log('TO-DO')
    }
  ];

  const body: DetailSectionProps['sections'] = [
    {
      title: { label: t('commons.description'), variant: 'subtitle1' },
      data: [
        {
          label: t('clientSil.table.clientName'),
          value: data?.clientName
        },
        {
          label: t('clientSil.table.clientId'),
          value: data?.clientId
        }
      ]
    },
    {
      title: { label: t('clientSilDetail.key'), variant: 'subtitle1' },
      data: [
        {
          childrenComponent: (
            <ClientSecret
              secretValue={data?.clientSecret || ''}
              organizationId={organizationId}
              clientId={data?.clientId || ''}
            />
          )
        }
      ]
    }
  ];

  return (
    <>
      {!isPending && (
        <>
          <TitleComponent
            title={truncTitle(data?.clientName || '')}
            description={t('clientSilDetail.description')}
            callToAction={actionButtons}
          />
          <Box mt={3}>
            <Stack spacing={2}>
              <DetailAccordion
                key={1}
                title={t('clientSil.create.section.description.title')}
                description={''}
                sections={body}
                defaultExpanded={true}
              />
            </Stack>
          </Box>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Stack spacing={2} direction="row">
              {actionButtons.map((button, index) => (
                <Button
                  size="large"
                  key={index}
                  startIcon={button.icon}
                  color={button.color}
                  variant={button.variant}
                  onClick={button.onActionClick}
                >
                  {button.buttonText}
                </Button>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </>
  );
};

export default ClientSilDetail;
