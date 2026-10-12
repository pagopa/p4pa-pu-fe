import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import {
  Button,
  Divider,
  IconButton,
  Stack,
  Switch,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OrganizationApiKey } from '@generated/core/data-contracts';

import utils from '@core/utils';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { KeyTypeEnum } from '@generated/core/client';
import { BaseDialog } from '@core/components/BaseDialog';
import {
  getOrganizationApiKey,
  deleteOrganizationApiKey
} from '@core/api/integrations';
import { copyWithFeedback } from '@core/utils/clipboard';

type ApiKeyDialogProps = {
  apiKey: OrganizationApiKey;
  organizationId: number;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export const ApiKeyDialog = ({
  apiKey,
  organizationId,
  open,
  onClose,
  onDelete
}: ApiKeyDialogProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const { data: organizationApiKey } = getOrganizationApiKey(
    organizationId,
    apiKey.keyType
  );

  const deleteApiKey = deleteOrganizationApiKey(organizationId, apiKey.keyType);

  const handleDelete = async () => {
    try {
      await deleteApiKey.mutateAsync();
      utils.notify.emit(t('commons.done'), 'success');
      onDelete();
    } catch {
      utils.notify.emit(t('errors.generic'));
    } finally {
      onClose();
    }
  };

  const copy = (value: string) => copyWithFeedback(value, t('commons.copied'));

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={t(`integrations.keyTypes.${apiKey.keyType}`)}
      description={t('integrations.dialogDescription')}
      actions={
        <Button
          color="error"
          startIcon={<DeleteOutlineIcon />}
          disabled={deleteApiKey.isPending}
          onClick={handleDelete}
        >
          {t('commons.delete')}
        </Button>
      }
    >
      <Stack gap={2}>
        {organizationApiKey?.keyType == KeyTypeEnum.IO && (
          <Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1">
                {t('integrations.apiKeyDialog.notifications')}
              </Typography>
              <Switch
                disabled
                value="notifications"
                checked={organizationApiKey?.serviceEnabled}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {organizationApiKey?.serviceEnabled
                ? t('commons.status.ACTIVE')
                : t('commons.status.INACTIVE')}
            </Typography>
          </Stack>
        )}

        <Divider />

        <Stack gap={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle2">
              {t('integrations.apiKeyDialog.apiKey')}
            </Typography>
            <IconButton
              aria-label={t(
                isVisible
                  ? 'integrations.apiKeyDialog.hide'
                  : 'integrations.apiKeyDialog.show'
              )}
              onClick={() => setIsVisible((visible) => !visible)}
            >
              {isVisible ? (
                <VisibilityOffIcon color="primary" />
              ) : (
                <VisibilityIcon color="primary" />
              )}
            </IconButton>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={1}
          >
            <Typography variant="monospaced" component="span" ml={1}>
              {isVisible ? organizationApiKey?.apiKey : SECRET_MASK}
            </Typography>
            <IconButton
              aria-label={t('integrations.apiKeyDialog.copy')}
              onClick={copy(organizationApiKey?.apiKey || '')}
            >
              <ContentCopyIcon color="primary" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </BaseDialog>
  );
};
