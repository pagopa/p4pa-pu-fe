import { PdndClientNoSecretDTO } from '@generated/core/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_PREFIX } from '../..';
import { Section, Row, Field } from '../Containers';
import { PdndClientDialog } from '../Dialogs/PdndClientDialog';

export const ClientsSection = ({
  clients
}: {
  clients: Array<PdndClientNoSecretDTO>;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [open, setOpen] = useState(false);
  if (clients.length === 0) return null;

  return (
    <Section title={t('pdndClients')}>
      {clients.map((client) => (
        <>
          <Row
            key={client.clientId}
            name={client.clientName}
            onShow={() => setOpen(true)}
          >
            <Field label={t('name')} width={'25%'}>
              {client.clientName}
            </Field>
            <Field label={t('clientId')} variant="monospaced">
              {client.clientId}
            </Field>
          </Row>
          {client && (
            <PdndClientDialog
              open={open}
              client={client}
              onClose={() => setOpen(false)}
            />
          )}
        </>
      ))}
    </Section>
  );
};
