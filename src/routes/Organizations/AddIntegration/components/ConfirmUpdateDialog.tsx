import { useTranslation } from 'react-i18next';

import GenericDialog from '@core/components/GenericDialog/GenericDialog';

import type { PendingUpdate } from '../AddIntegrationSchema';

const TEST_ID_BY_TYPE: Record<PendingUpdate['type'], string> = {
  eservice: 'confirm-eservice-update-dialog',
  pdndClient: 'confirm-pdnd-client-update-dialog'
};

type ConfirmUpdateDialogProps = {
  type: PendingUpdate['type'];
  confirmLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmUpdateDialog = ({
  type,
  confirmLoading,
  onConfirm,
  onCancel
}: ConfirmUpdateDialogProps) => {
  const { t } = useTranslation();

  return (
    <GenericDialog
      open
      data-testid={TEST_ID_BY_TYPE[type]}
      title={t('integrations.edit.confirmDialog.title')}
      message={t('integrations.edit.confirmDialog.message')}
      confirmLabel={t('commons.confirm')}
      cancelLabel={t('commons.cancel')}
      confirmLoading={confirmLoading}
      onConfirm={onConfirm}
      onClose={() => {
        // The request is in flight: closing would hide a pending update.
        if (!confirmLoading) {
          onCancel();
        }
      }}
    />
  );
};
