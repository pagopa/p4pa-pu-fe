import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export type RemovePaymentsConfirmModalProps = {
  open: boolean;
  selectedAssessmentDetailIds: number[];
  onConfirm: (assessmentDetailIds: number[]) => void;
  onCancel: () => void;
  'data-testid'?: string;
};

/**
 * Modal of confirmation for the removal of payments from Assessment
 *
 * Shows a confirmation before proceeding with the removal of the selected payments.
 * Follows the GenericDialog pattern of the project for consistency UI.
 */
export const RemovePaymentsConfirmModal = ({
  open,
  selectedAssessmentDetailIds,
  onConfirm,
  onCancel,
  'data-testid': testId = 'remove-payments-confirm-modal'
}: RemovePaymentsConfirmModalProps) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm(selectedAssessmentDetailIds);
  };

  const selectedCount = selectedAssessmentDetailIds.length;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth={false}
      maxWidth="sm"
      data-testid={testId}
    >
      <DialogTitle sx={{ px: 4, pt: 4 }}>
        <Typography variant="h6" component="div">
          {t('assessmentCreate.removePayments.confirmModal.title')}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <DialogContentText>
          {t('assessmentCreate.removePayments.confirmModal.description')}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          data-testid={`${testId}-cancel-button`}
        >
          {t('commons.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          data-testid={`${testId}-confirm-button`}
          disabled={selectedCount === 0}
        >
          {t('commons.onlyRemove')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
