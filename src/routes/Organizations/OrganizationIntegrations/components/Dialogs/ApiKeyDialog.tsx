import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BaseDialog } from '@core/components/BaseDialog';
import { SECRET_MASK } from '@core/components/ShowSecretValue';

import { KeyTypeEnum } from '@generated/core/client';
import { copyWithFeedback } from '@core/utils/clipboard';

import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { OrganizationApiKey } from '@generated/core/data-contracts';
import { useGetOrganizationApiKey } from '@core/api/integrations';

type ApiKeyDialogProps = {
  organizationApiKey: OrganizationApiKey;
  organizationId: number;
  open: boolean;
  onClose: () => void;
};

export const ApiKeyDialog = ({
  organizationApiKey,
  organizationId,
  open,
  onClose,
}: ApiKeyDialogProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  
  const copy = (value: string) => {
    copyWithFeedback(value, t('commons.copied'));
  };

  const { data: { apiKey = '' } = {} } = useGetOrganizationApiKey(
    organizationId,
    organizationApiKey.keyType
  );

  const parsedApiKey = String(apiKey);

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={t(`integrations.keyTypes.${organizationApiKey.keyType}`)}
      description={t('integrations.dialogDescription')}
    >
      <Stack gap={1}>
        {String(organizationApiKey.keyType) === KeyTypeEnum.IO && (
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
              {String(organizationApiKey.keyType) == KeyTypeEnum.IO
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
