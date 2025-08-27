import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type DialogAction = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  variant?: 'default' | 'warning' | 'error' | 'success';
  testId?: string;
  showCancel?: boolean;
};

export type UseConfirmDialogReturn = {
  isOpen: boolean;
  currentAction: DialogAction | null;

  showDialog: (action: DialogAction) => void;
  closeDialog: () => void;
  handleConfirm: () => Promise<void>;

  showDeleteDialog: (onConfirm: () => void | Promise<void>) => void;
  showDisableDialog: (onConfirm: () => void | Promise<void>) => void;
  showEnableDialog: (onConfirm: () => void | Promise<void>) => void;
  showErrorDialog: (
    errorType?: 'genericErrorDescription' | 'alreadyUsedDescription',
    customMessage?: string
  ) => void;

  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: Partial<DialogAction>
  ) => void;
};

export const useConfirmDialog = (): UseConfirmDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<DialogAction | null>(null);
  const { t } = useTranslation();

  const showDialog = (action: DialogAction) => {
    setCurrentAction({
      cancelLabel: t('commons.close'),
      showCancel: true,
      variant: 'default',
      ...action
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setCurrentAction(null);
  };

  const handleConfirm = async () => {
    if (currentAction?.onConfirm) {
      try {
        await currentAction.onConfirm();
      } catch (error) {
        console.error('Error during dialog confirmation:', error);
        return;
      }
    }
    closeDialog();
  };

  const showDeleteDialog = (onConfirm: () => void | Promise<void>) => {
    showDialog({
      title: t('debtTypeCatalogDetail.confirmDialog.title'),
      message: t('debtTypeCatalogDetail.confirmDialog.description'),
      confirmLabel: t('commons.delete'),
      onConfirm,
      variant: 'error',
      testId: 'confirm-delete-dialog'
    });
  };

  const showDisableDialog = (onConfirm: () => void | Promise<void>) => {
    showDialog({
      title: t('debtTypeDetail.confirmDisableDialog.title'),
      message: t('debtTypeDetail.confirmDisableDialog.description'),
      confirmLabel: t('commons.disable'),
      onConfirm,
      variant: 'warning',
      testId: 'confirm-disable-dialog'
    });
  };

  const showEnableDialog = (onConfirm: () => void | Promise<void>) => {
    showDialog({
      title: t('debtTypeDetail.confirmEnableDialog.title'),
      message: t('debtTypeDetail.confirmEnableDialog.description'),
      confirmLabel: t('commons.enable'),
      onConfirm,
      variant: 'success',
      testId: 'confirm-enable-dialog'
    });
  };

  const showErrorDialog = (
    errorType:
      | 'genericErrorDescription'
      | 'alreadyUsedDescription' = 'genericErrorDescription',
    customMessage?: string
  ) => {
    showDialog({
      title: t('debtTypeCatalogDetail.errorDialog.title'),
      message:
        customMessage || t(`debtTypeCatalogDetail.errorDialog.${errorType}`),
      confirmLabel: t('commons.close'),
      variant: 'error',
      testId: 'error-dialog',
      showCancel: false
    });
  };

  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options: Partial<DialogAction> = {}
  ) => {
    showDialog({
      title,
      message,
      confirmLabel: t('commons.confirm'),
      onConfirm,
      variant: 'default',
      ...options
    });
  };

  return {
    isOpen,
    currentAction,
    showDialog,
    closeDialog,
    handleConfirm,
    showDeleteDialog,
    showDisableDialog,
    showEnableDialog,
    showErrorDialog,
    showConfirmDialog
  };
};
