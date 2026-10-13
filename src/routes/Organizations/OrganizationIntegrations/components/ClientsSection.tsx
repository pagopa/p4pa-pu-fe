import { PdndClientNoSecretDTO } from '@generated/core/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_PREFIX } from '..';
import { Section, Row, Field } from './Containers';

export const ClientsSection = ({
  clients
}: {
  clients: Array<PdndClientNoSecretDTO>;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [, setSelected] = useState<PdndClientNoSecretDTO>();
  if (clients.length === 0) return null;

  return (
    <Section title={t('pdndClients')}>
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
      {/* {selected && ( */}
      {/*   <PdndClientDialog */}
      {/*     open */}
      {/*     client={selected} */}
      {/*     onClose={() => setSelected(undefined)} */}
      {/*   /> */}
      {/* )} */}
    </Section>
  );
};
