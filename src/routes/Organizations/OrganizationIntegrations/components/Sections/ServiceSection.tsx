import type { PdndServiceView } from '@generated/core/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Section, Row, Field } from '../Containers';
import { PdndSendServiceDialog } from '../Dialogs/ServiceDialog';
import utils from '@core/utils';
import notify from '@core/utils/notify';
import { useDeletePdndService } from '@core/api/integrations';
import { useNavigate, generatePath } from 'react-router';
import { PageRoutes } from '@core/routes';
import { IntegrationType } from '@core/routes/Organizations/enums';

export const ServicesSection = ({
  services,
  organizationId,
  onDelete
}: {
  services: Array<PdndServiceView>;
  organizationId: number;
  onDelete: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PdndServiceView>();

  const deletePdndServiceMutation = useDeletePdndService(organizationId);

  const confirmDeletePdndService = (service: PdndServiceView) => {
    utils.dialog.open({
      title: t('organizations.integrations.deleteDialog.title'),
      message: t('organizations.integrations.deleteDialog.pdndService'),
      onConfirm: () => {
        handleDeletePdndService(service);
        utils.dialog.close();
      }
    });
  };

  const handleDeletePdndService = async (service: PdndServiceView) => {
    try {
      if(!service.purposeId) throw new Error('Purpose ID is required');
      await deletePdndServiceMutation.mutateAsync({purposeId: service.purposeId});
      notify.emit(t('commons.done'), 'success');
      onDelete();
    } catch {
      notify.emit(t('errors.generic'));
    } finally {
      utils.dialog.close();
    }
  };

  const handleEdit = (service: PdndServiceView) => {
    if (!service.purposeId) return;

    const searchParams = new URLSearchParams({
      purposeId: service.purposeId
    });
    if (service.subUnitCode) {
      searchParams.set('subUnitCode', service.subUnitCode);
    }

    navigate(
      `${generatePath(PageRoutes.EDIT_INTEGRATION, {
        organizationId: String(organizationId),
        IntegrationType: IntegrationType.E_SERVICE
      })}?${searchParams.toString()}`
    );
  };

  return (
    <Section title={t('pdndServices')}>
      {selected && (
        <PdndSendServiceDialog
          open
          service={selected}
          onClose={() => setSelected(undefined)}
        />
      )}
      {services.map((service) => (
        <Row
          key={`${service.serviceType}-${service.purposeId}`}
          name={service.serviceName}
          onShow={() => setSelected(service)}
          onDelete={() => confirmDeletePdndService(service)}
          onEdit={() => handleEdit(service) }
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
