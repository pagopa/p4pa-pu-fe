
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PdndClientNoSecretDTO } from '@generated/core/data-contracts';

import { BaseDialog } from '@core/components/BaseDialog';
import { CopiableField } from '@core/components/CopiableField';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { copyWithFeedback } from '@core/utils/clipboard';

import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type PdndClientDialogProps = {
  open: boolean;
  client: PdndClientNoSecretDTO;
  onClose: () => void;
};

export const PdndClientDialog = ({
  open,
  client,
  onClose,
}: PdndClientDialogProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const copy = (value: string) => {
    copyWithFeedback(value, t('commons.copied'));
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={client.clientName}
      description={t('integrations.dialogDescription')}
    >
      <Stack gap={2}>
        <CopiableField
          label={t('integrations.clientDialog.clientId')}
          value={client.clientId}
        />

        <Divider />
        <CopiableField
          label={t('integrations.clientDialog.kid')}
          copyLabel={t('commons.copy_male', {
            label: t('integrations.clientDialog.kid')
          })}
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
