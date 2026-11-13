import { useTranslation } from 'react-i18next';
import type { PdndServiceView } from '@generated/core/data-contracts';
import { BaseDialog } from '@core/components/BaseDialog';
import { CopiableField } from '@core/components/CopiableField';
import { Field } from '../Containers';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

type ServiceDialogProps = {
  service: PdndServiceView;
  open: boolean;
  onClose: () => void;
};

export const PdndSendServiceDialog = ({
  service,
  open,
  onClose,
}: ServiceDialogProps) => {
  const { t } = useTranslation();

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={service.serviceType}
      description={t('integrations.dialogDescription')}
    >
      <Stack gap={2}>
        <Field label={t('integrations.serviceDialog.clientName')}>
          {service.clientName}
        </Field>

        {service.purposeId && (
          <>
            <Divider />
            <CopiableField
              label={t('integrations.serviceDialog.purposeId')}
              value={service.purposeId}
              labelPrefix="commons.copy_male"
            />
          </>
        )}

        <Divider />
        <CopiableField
          label={t('integrations.serviceDialog.clientId')}
          value={service.clientId}
          copyLabel={t('integrations.serviceDialog.copyClientId')}
        />
      </Stack>
    </BaseDialog>
  );
};
