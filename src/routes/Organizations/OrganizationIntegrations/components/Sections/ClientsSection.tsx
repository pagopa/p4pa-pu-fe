import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PdndClientNoSecretDTO } from '@generated/core/client';

import { I18N_PREFIX } from '../..';
import { Field, Row, Section } from '../Containers';
import { PdndClientDialog } from '../Dialogs/ClientDialog';

export const ClientsSection = ({
  clients,
  organizationId,
  onDelete
}: {
  clients: Array<PdndClientNoSecretDTO>;
  organizationId: number;
  onDelete: () => void;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [selected, setSelected] = useState<PdndClientNoSecretDTO>();

  return (
    <Section title={t('pdndClients')}>
      {selected && (
        <PdndClientDialog
          open
          client={selected}
          organizationId={organizationId}
          onClose={() => setSelected(undefined)}
          onDelete={onDelete}
        />
      )}
      {clients.map((client) => (
        <Row
          key={client.clientId}
          name={client.clientName}
          onShow={() => setSelected(client)}
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
