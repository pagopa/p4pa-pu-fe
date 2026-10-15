import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import { Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PdndClientNoSecretDTO } from '@generated/core/data-contracts';

import { deletePdndClient } from '@core/api/integrations';
import { BaseDialog } from '@core/components/BaseDialog';
import { CopiableField } from '@core/components/CopiableField';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { copyWithFeedback } from '@core/utils/clipboard';
import notify from '@core/utils/notify';

type PdndClientDialogProps = {
  open: boolean;
  client: PdndClientNoSecretDTO;
  organizationId: number;
  onClose: () => void;
  onDelete: () => void;
};

export const PdndClientDialog = ({
  open,
  client,
  organizationId,
  onClose,
  onDelete
}: PdndClientDialogProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const copy = (value: string) => {
    copyWithFeedback(value, t('commons.copied'));
  };

  const deleteService = deletePdndClient(organizationId, client.clientId);

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
      title={client.clientName}
      description={t('integrations.clientDescription')}
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
        <CopiableField
          label={t('integrations.clientDialog.clientId')}
          value={client.clientId}
        />

        <Divider />
        <CopiableField
          label={t('integrations.clientDialog.kid')}
          copyLabel={t('commons.copy_male', t('integrations.clientDialog.kid'))}
          value={client.kid}
        />

        <Divider />

        <Stack gap={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="subtitle2"
              color="text.dark"
              textTransform="uppercase"
            >
              {t('integrations.apiKeyDialog.apiKey')}
            </Typography>
            <IconButton
              size="small"
              aria-label={t(
                isVisible
                  ? 'integrations.apiKeyDialog.hide'
                  : 'integrations.apiKeyDialog.show'
              )}
              onClick={() => setIsVisible((visible) => !visible)}
            >
              {isVisible ? (
                <VisibilityOffIcon fontSize="small" color="primary" />
              ) : (
                <VisibilityIcon fontSize="small" color="primary" />
              )}
            </IconButton>
          </Stack>
          <Stack
            direction="row"
            py={1.5}
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1}
          >
            <Typography
              variant="monospaced"
              color={'text.dark'}
              sx={{
                overflowWrap: 'anywhere',
                mt: 0.5
              }}
            >
              {isVisible ? client.publicKey : SECRET_MASK}
            </Typography>
            <IconButton
              aria-label={t('integrations.apiKeyDialog.copy')}
              onClick={() => copy(client.publicKey)}
              size="small"
            >
              <ContentCopyIcon color="primary" fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </BaseDialog>
  );
};
