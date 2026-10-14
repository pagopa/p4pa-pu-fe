import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { PdndServiceView } from '@generated/core/data-contracts';

import { BaseDialog } from '@core/components/BaseDialog';
import { copyWithFeedback } from '@core/utils/clipboard';
import { deletePdndService } from '@core/api/integrations';
import { useEffect } from 'react';
import notify from '@core/utils/notify';

type ServiceDialogProps = {
  service: PdndServiceView;
  organizationId: number;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

type FieldProps = {
  label: string;
  value: string;
  copyLabel?: string;
  onCopy?: () => void;
};

const Field = ({ label, value, copyLabel, onCopy }: FieldProps) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    gap={1}
  >
    <Stack>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body1"
        fontWeight={onCopy ? 400 : 600}
        color={onCopy ? 'primary' : 'text.primary'}
        sx={{ wordBreak: 'break-all' }}
      >
        {value}
      </Typography>
    </Stack>
    {onCopy && (
      <IconButton aria-label={copyLabel} onClick={onCopy}>
        <ContentCopyIcon color="primary" />
      </IconButton>
    )}
  </Stack>
);

export const PdndSendServiceDialog = ({
  service,
  organizationId,
  open,
  onClose,
  onDelete
}: ServiceDialogProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!service?.purposeId) {
      notify.emit(t('errors.generic'));
      onClose();
    }
  }, []);

  const deleteService = deletePdndService(
    organizationId,
    service.purposeId as string
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

  const copy = (value: string, label: string) =>
    copyWithFeedback(value, `${label} ${t('commons.copied')}`);

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
        <Field
          label={t('integrations.serviceDialog.clientName')}
          value={service.clientName}
        />

        {service.purposeId && (
          <>
            <Divider />
            <Field
              label={t('integrations.serviceDialog.purposeId')}
              value={service.purposeId}
              copyLabel={t('integrations.serviceDialog.copyPurposeId')}
              onCopy={copy(
                service.purposeId,
                t('integrations.serviceDialog.purposeId')
              )}
            />
          </>
        )}

        <Divider />
        <Field
          label={t('integrations.serviceDialog.clientId')}
          value={service.clientId}
          copyLabel={t('integrations.serviceDialog.copyClientId')}
          onCopy={copy(
            service.clientId,
            t('integrations.serviceDialog.clientId')
          )}
        />
      </Stack>
    </BaseDialog>
  );
};
