import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
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
  onEdit: (service: PdndServiceView) => void;
};

export const PdndSendServiceDialog = ({
  service,
  open,
  onClose,
  onEdit,
}: ServiceDialogProps) => {
  const { t } = useTranslation();

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={service.serviceType}
      description={t('integrations.dialogDescription')}
      actions={
        <Button
          color="primary"
          variant="outlined"
          onClick={() => onEdit(service)}
        >
          {t('commons.edit')}
        </Button>
      }
    >
      <Stack gap={2}>
        <Field label={t('integrations.serviceDialog.serviceName')}>
          {service.serviceName}
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
