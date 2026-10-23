import { SECRET_MASK } from '@core/components/ShowSecretValue';
import type { OrganizationApiKey } from '@generated/core/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18N_PREFIX } from '../..';
import { ApiKeyDialog } from '../Dialogs/ApiKeyDialog';
import { Section, Row, Field } from '../Containers';
import Chip from '@mui/material/Chip';

export const ApiKeysSection = ({
  apiKeys,
  organizationId,
  onDelete
}: {
  apiKeys: Array<OrganizationApiKey>;
  organizationId: number;
  onDelete: () => void;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [selected, setSelected] = useState<OrganizationApiKey>();
  if (apiKeys.length === 0) return null;

  return (
    <Section title={t('pagoPaProducts')}>
      {selected && (
        <ApiKeyDialog
          open
          apiKey={selected}
          organizationId={organizationId}
          onClose={() => setSelected(undefined)}
          onDelete={onDelete}
        />
      )}
      {apiKeys.map((apiKey) => {
        const name = t(`keyTypes.${apiKey.keyType}`);
        return (
          <Row
            key={apiKey.keyType}
            name={name}
            onShow={() => setSelected(apiKey)}
          >
            <Field label={t('name')} width={'50%'}>
              {name}
            </Field>
            {apiKey.flagActive !== undefined && (
              <Field label={t('ioNotifications')}>
                <Chip
                  size="small"
                  color={apiKey.flagActive ? 'primary' : 'default'}
                  sx={{ '& .MuiChip-label': { fontWeight: 600 } }}
                  label={t(apiKey.flagActive ? 'active' : 'inactive')}
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
