import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';

import type { PdndServiceView } from '@generated/core/data-contracts';

import { BaseDialog } from '@core/components/BaseDialog';
import { deletePdndService } from '@core/api/integrations';
import notify from '@core/utils/notify';
import { CopiableField } from '@core/components/CopiableField';
import { Field } from '../Containers';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

type ServiceDialogProps = {
  service: PdndServiceView;
  organizationId: number;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export const PdndSendServiceDialog = ({
  service,
  organizationId,
  open,
  onClose,
  onDelete
}: ServiceDialogProps) => {
  const { t } = useTranslation();

  const deleteService = deletePdndService(
    organizationId,
    service?.purposeId || ''
  );

  const handleDelete = async () => {
    try {
      await deleteService.mutateAsync();
      notify.emit(t('commons.done'), 'success');
      onDelete();
    } catch {
      notify.emit(t('errors.generic'));
    } finally {
      onClose();
    }
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={service.serviceType}
      description={t('integrations.dialogDescription')}
      actions={
        <Button
          color="error"
          startIcon={<DeleteOutlineIcon />}
          disabled={deleteService.isPending}
          onClick={handleDelete}
        >
          {t('commons.delete')}
        </Button>
      }
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
