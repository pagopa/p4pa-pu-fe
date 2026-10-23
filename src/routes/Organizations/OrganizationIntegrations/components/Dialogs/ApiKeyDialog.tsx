import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { OrganizationApiKey } from '@generated/core/data-contracts';

import {
  deleteOrganizationApiKey,
  getOrganizationApiKey
} from '@core/api/integrations';
import { BaseDialog } from '@core/components/BaseDialog';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { copyWithFeedback } from '@core/utils/clipboard';
import notify from '@core/utils/notify';
import { KeyTypeEnum } from '@generated/core/client';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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

  const { data: organizationApiKey, isSuccess } = getOrganizationApiKey(
    organizationId,
    apiKey.keyType
  );

  useEffect(() => {
    if (!organizationApiKey?.apiKey && isSuccess) {
      setIsVisible(false);
      notify.emit(t('errors.generic'));
    }
  }, [open]);

  const deleteApiKey = deleteOrganizationApiKey(organizationId, apiKey.keyType);
  const parsedApiKey = String(organizationApiKey?.apiKey);

  const handleDelete = async () => {
    try {
      await deleteApiKey.mutateAsync();
      notify.emit(t('commons.done'), 'success');
      onDelete();
    } catch {
      notify.emit(t('errors.generic'));
    } finally {
      onClose();
    }
  };

  const copy = (value: string) => {
    copyWithFeedback(value, t('commons.copied'));
  };

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
      <Stack gap={1}>
        {organizationApiKey?.keyType == KeyTypeEnum.IO && (
          <Stack gap={0.8} py={1.5}>
            <Typography
              variant="subtitle2"
              lineHeight={0}
              color="text.secondary"
            >
              {t('integrations.apiKeyDialog.notifications')}
            </Typography>
            <Typography
              variant="body2"
              color="text.dark"
              fontWeight={600}
              letterSpacing={0}
            >
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
            justifyContent="space-between"
            alignItems="center"
            p={1.5}
            pr={0}
            gap={1}
          >
            <Typography variant="monospaced" component="span">
              {isVisible ? parsedApiKey : SECRET_MASK}
            </Typography>
            <IconButton
              size="small"
              aria-label={t('integrations.apiKeyDialog.copy')}
              onClick={() => copy(parsedApiKey || '')}
            >
              <ContentCopyIcon fontSize="small" color="primary" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </BaseDialog>
  );
};
