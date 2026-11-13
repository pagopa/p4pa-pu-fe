import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { OrganizationApiKeyType, type OrganizationApiKey } from '@generated/core/client';
import { useState } from 'react';
import { useNavigate, generatePath } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ApiKeyDialog } from '../Dialogs/ApiKeyDialog';
import { Section, Row, Field } from '../Containers';
import Chip from '@mui/material/Chip';
import { useDeleteOrganizationApiKey } from '@core/api/integrations';
import notify from '@core/utils/notify';
import utils from '@core/utils';
import { PageRoutes } from '@core/routes';
import { IntegrationType } from '@core/routes/Organizations/enums';
import { I18N_PREFIX } from '../..';

export const ApiKeysSection = ({
  organizationApiKeys,
  organizationId,
  onDelete
}: {
  organizationApiKeys: Array<OrganizationApiKey>;
  organizationId: number;
  onDelete: () => void;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const navigate = useNavigate();
  const [selectedOrganizationApiKey, setSelectedOrganizationApiKey] = useState<OrganizationApiKey>();

  const deleteApiKey = useDeleteOrganizationApiKey(organizationId);

  const confirmDeleteApiKey = (keyType: OrganizationApiKeyType) => {
    utils.dialog.open({
      title: t('organizations.integrations.deleteDialog.title'),
      message: t('organizations.integrations.deleteDialog.apiKey'),
      onConfirm: () => {
        handleDeleteApiKey(keyType!);
        utils.dialog.close();
      }
    });
  };

  const handleDeleteApiKey = async (organizationApiKeyType: OrganizationApiKeyType) => {
    try {
      await deleteApiKey.mutateAsync({organizationApiKeyType});
      notify.emit(t('commons.done'), 'success');
      onDelete();
    } catch {
      notify.emit(t('errors.generic'));
    } finally {
      utils.dialog.close();
    }
  };

  const handleEdit = (organizationApiKey: OrganizationApiKey) => {
    const searchParams = new URLSearchParams({
      keyType: organizationApiKey.keyType
    });

    if (
      organizationApiKey.keyType === OrganizationApiKeyType.IO &&
      organizationApiKey.flagActive !== undefined
    ) {
      searchParams.set(
        'serviceEnabled',
        String(organizationApiKey.flagActive)
      );
    }
    navigate(
      `${generatePath(PageRoutes.EDIT_INTEGRATION, {
        organizationId: String(organizationId),
        IntegrationType: IntegrationType.PAGOPA_PRODUCT
      })}?${searchParams.toString()}`
    );
  };

  return (
    <Section title={t('pagoPaProducts')}>
      {selectedOrganizationApiKey && (
        <ApiKeyDialog
          open
          organizationApiKey={selectedOrganizationApiKey}
          organizationId={organizationId}
          onClose={() => setSelectedOrganizationApiKey(undefined)}
        />
      )}
      {organizationApiKeys.map((organizationApiKey) => {
        const name = t(`keyTypes.${organizationApiKey.keyType}`);
        return (
          <Row
            key={organizationApiKey.keyType}
            onShow={() => setSelectedOrganizationApiKey(organizationApiKey)}
            onDelete={() => confirmDeleteApiKey(organizationApiKey.keyType)}
            onEdit={() => handleEdit(organizationApiKey)}
          >
            <Field label={t('name')} width={'50%'}>
              {name}
            </Field>
            {organizationApiKey.flagActive !== undefined && (
              <Field label={t('ioNotifications')}>
                <Chip
                  size="small"
                  color={organizationApiKey.flagActive ? 'primary' : 'default'}
                  sx={{ '& .MuiChip-label': { fontWeight: 600 } }}
                  label={t(organizationApiKey.flagActive ? 'active' : 'inactive')}
                />
              </Field>
            )}
            <Field label={t('apiKey')}>
              <span role="img" aria-label={t('hiddenApiKey')}>
                {SECRET_MASK}
              </span>
            </Field>
          </Row>
        );
      })}
    </Section>
  );
};
