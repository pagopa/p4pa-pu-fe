import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PdndClientNoSecretDTO } from '@generated/core/client';

import { Field, Row, Section } from '../Containers';
import { PdndClientDialog } from '../Dialogs/ClientDialog';
import notify from '@core/utils/notify';
import { useDeletePdndClient } from '@core/api/integrations';
import utils from '@core/utils';
import { useNavigate, generatePath } from 'react-router';
import { PageRoutes } from '@core/routes';
import { IntegrationType } from '@core/routes/Organizations/enums';

export const ClientsSection = ({
  clients,
  organizationId,
  onDelete
}: {
  clients: Array<PdndClientNoSecretDTO>;
  organizationId: number;
  onDelete: () => void;
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<PdndClientNoSecretDTO>();
  const navigate = useNavigate();
  const deletePdndClientMutation = useDeletePdndClient(organizationId);

  const confirmDeletePdndClient = (client: PdndClientNoSecretDTO) => {
    utils.dialog.open({
      title: t('organizations.integrations.deleteDialog.title'),
      message: t('organizations.integrations.deleteDialog.pdndClient'),
      onConfirm: () => {
        handleDeletePdndClient(client);
        utils.dialog.close();
      }
    });
  };

  const handleDeletePdndClient = async (client: PdndClientNoSecretDTO) => {
    try {
      if (!client.clientId) throw new Error('Client ID is required');
      await deletePdndClientMutation.mutateAsync(client.clientId);
      notify.emit(t('commons.done'), 'success');
      onDelete();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        notify.emit(
          t('integrations.clientDialog.deleteError.message'),
          'error',
          t('integrations.clientDialog.deleteError.title')
        );
      } else {
        notify.emit(t('errors.generic'));
      }
    } finally {
      utils.dialog.close();
    }
  };

  const handleEditPdndClient = (client: PdndClientNoSecretDTO) => {
    const searchParams = new URLSearchParams({
      clientId: client.clientId
    });
    if (client.subUnitCode) {
      searchParams.set('subUnitCode', client.subUnitCode);
    }

    navigate(
      `${generatePath(PageRoutes.EDIT_INTEGRATION, {
        organizationId: String(organizationId),
        IntegrationType: IntegrationType.PDND_CLIENT
      })}?${searchParams.toString()}`
    );
  };

  return (
    <Section title={t('pdndClients')}>
      {selected && (
        <PdndClientDialog
          open
          client={selected}
          onClose={() => setSelected(undefined)}
          onEdit={handleEditPdndClient}
        />
      )}
      {clients.map((client) => (
        <Row
          key={client.clientId}
          name={client.clientName}
          onShow={() => setSelected(client)}
          onEdit={() => setSelected(client)}
          onDelete={() => confirmDeletePdndClient(client)}
        >
          <Field label={t('name')} width={'25%'}>
            {client.clientName}
          </Field>
          <Field label={t('clientId')} variant="monospaced">
            {client.clientId}
          </Field>
        </Row>
      ))}
    </Section>
  );
};
