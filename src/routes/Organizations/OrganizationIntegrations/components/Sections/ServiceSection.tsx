import type { PdndServiceView } from '@generated/core/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_PREFIX } from '../..';
import { Section, Row, Field } from '../Containers';
import { PdndSendServiceDialog } from '../Dialogs/ServiceDialog';

export const ServicesSection = ({
  services,
  organizationId,
  onDelete
}: {
  services: Array<PdndServiceView>;
  organizationId: number;
  onDelete: () => void;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [selected, setSelected] = useState<PdndServiceView>();
  if (services.length === 0) return null;

  return (
    <Section title={t('pdndServices')}>
      {selected && (
        <PdndSendServiceDialog
          open
          service={selected}
          organizationId={organizationId}
          onClose={() => setSelected(undefined)}
          onDelete={onDelete}
        />
      )}
      {services.map((service) => (
        <Row
          key={`${service.serviceType}-${service.purposeId}`}
          name={service.serviceName}
          onShow={() => setSelected(service)}
        >
          <Field label={t('name')} width={'25%'}>
            {service.serviceName}
          </Field>
          <Field label={t('purposeId')} variant="monospaced">
            {service.purposeId || '-'}
          </Field>
          <Field label={t('clientId')} variant="monospaced">
            {service.clientId}
          </Field>
        </Row>
      ))}
    </Section>
  );
};
