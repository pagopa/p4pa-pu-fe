import { signal } from '@preact/signals-react';
import type { GenericDialogProps } from '../components/GenericDialog/GenericDialog';

type DialogOptions = Omit<GenericDialogProps, 'open' | 'onClose'> & {
  onClose?: () => void;
};

/** open a Dialog notification */
const open = (dialog: DialogOptions) => {
  isDialogVisible.value = true;
  dialogPayload.value['data-testid'] = dialog['data-testid'];
  dialogPayload.value.title = dialog.title;
  dialogPayload.value.message = dialog.message;
  dialogPayload.value.confirmLabel = dialog.confirmLabel;
  dialogPayload.value.cancelLabel = dialog.cancelLabel;
  dialogPayload.value.onConfirm = dialog.onConfirm;
  dialogPayload.value.onClose = () => {
    close();
    dialog.onClose?.();
  };
};

/** dismiss a notification */
const close = () => {
  isDialogVisible.value = false;
  dialogPayload.value = resetState;
};

const resetState: GenericDialogProps = {
  title: '',
  open: false,
  onClose: () => undefined
};

const isDialogVisible = signal<boolean>(false);
const dialogPayload = signal<GenericDialogProps>(resetState);

export default {
  open,
  close,
  status: {
    isDialogVisible,
    dialogPayload
  }
};
