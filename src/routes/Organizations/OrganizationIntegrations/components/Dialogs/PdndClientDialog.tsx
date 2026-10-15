import { BaseDialog } from '@core/components/BaseDialog';
import { PdndClientNoSecretDTO } from '@generated/core/data-contracts';
import { Divider, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CopiableField } from '@core/components/CopiableField';

type PdndClientDialogProps = {
  open: boolean;
  onClose: () => void;
  client: PdndClientNoSecretDTO;
};

export const PdndClientDialog = ({
  open,
  onClose,
  client
}: PdndClientDialogProps) => {
  const { t } = useTranslation();

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={client.clientName}
      description={t('integrations.clientDescription')}
      actions={<div />}
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
        <CopiableField
          label={t('integrations.clientDialog.publicKey')}
          value={client.publicKey}
        />
      </Stack>
    </BaseDialog>
  );
};
