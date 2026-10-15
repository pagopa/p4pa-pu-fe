import { BaseDialog } from '@core/components/BaseDialog';
import { PdndClientNoSecretDTO } from '@generated/core/data-contracts';
import { useTranslation } from 'react-i18next';

type PdndClientDialogProps = {
  open: boolean;
  onClose: () => void;
  client: PdndClientNoSecretDTO;
};

export const PdndClientDialog = ({ open, onClose }: PdndClientDialogProps) => {
  const { t } = useTranslation();

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={t('integrations.pdndClient')}
      description={t('integrations.pdndClientDescription')}
      actions={<div />}
    >
      <p>{t('integrations.pdndClientDescription')}</p>
    </BaseDialog>
  );
};
