import { PdndServiceView } from '@generated/core/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_PREFIX } from '..';
import { Section, Row, Field } from './Containers';

export const ServicesSection = ({
  services
}: {
  services: Array<PdndServiceView>;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [, setSelected] = useState<PdndServiceView>();
  if (services.length === 0) return null;

  return (
    <Section title={t('pdndServices')}>
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
      {/* {selected && ( */}
      {/*   <PdndSendServiceDialog */}
      {/*     open */}
      {/*     service={selected} */}
      {/*     onClose={() => setSelected(undefined)} */}
      {/*   /> */}
      {/* )} */}
    </Section>
  );
};
