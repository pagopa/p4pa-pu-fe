/**
 * Form Action Buttons Component
 * Displays action buttons: Back, Save Draft (conditional), and Submit
 */

import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowBack, Save } from '@mui/icons-material';

type FormActionButtonsProps = {
  onBack?: () => void;
  onSubmit: () => void;
  onSaveDraft?: () => void;
  disableSubmit?: boolean;
  disableBack?: boolean;
  disableSaveDraft?: boolean;
  submitLabel?: string;
  backLabel?: string;
  saveDraftLabel?: string;
  showSaveDraft?: boolean;
  isSubmitting?: boolean;
};

/**
 * Form Action Buttons Component
 * Renders action buttons for the unified organization edit form
 *
 * @param props - Component props
 * @param props.onBack - Handler for back button
 * @param props.onSubmit - Handler for submit button (main action)
 * @param props.onSaveDraft - Handler for save draft button
 * @param props.disableSubmit - Whether to disable submit button
 * @param props.disableBack - Whether to disable back button
 * @param props.disableSaveDraft - Whether to disable save draft button
 * @param props.submitLabel - Translation key for submit button label
 * @param props.backLabel - Translation key for back button label
 * @param props.saveDraftLabel - Translation key for save draft button label
 * @param props.showSaveDraft - Whether to show save draft button
 * @param props.isSubmitting - Whether form is submitting (for loading state)
 * @returns JSX element containing action buttons
 */
export const FormActionButtons = ({
  onBack,
  onSubmit,
  onSaveDraft,
  disableBack = false,
  disableSubmit = false,
  disableSaveDraft = false,
  backLabel = 'commons.back',
  submitLabel = 'organizationEditWizard.saveChanges',
  saveDraftLabel = 'commons.saveDraft',
  showSaveDraft = false,
  isSubmitting = false
}: FormActionButtonsProps) => {
  const { t } = useTranslation();

  return (
    <Box
      mt={4}
      display="flex"
      justifyContent="space-between"
      data-testid="form-action-buttons"
    >
      <Box>
        <Button
          id="form-back-button"
          data-testid="form-back-button"
          variant="outlined"
          onClick={onBack}
          disabled={disableBack}
          startIcon={<ArrowBack />}
        >
          {t(backLabel)}
        </Button>
      </Box>
      <Box display="flex" gap={4}>
        {showSaveDraft && (
          <Button
            id="form-save-draft-button"
            data-testid="form-save-draft-button"
            variant="text"
            onClick={onSaveDraft}
            disabled={disableSaveDraft || isSubmitting}
            startIcon={<Save />}
          >
            {t(saveDraftLabel)}
          </Button>
        )}
        <Button
          id="form-submit-button"
          data-testid="form-submit-button"
          variant="contained"
          onClick={onSubmit}
          disabled={disableSubmit || isSubmitting}
        >
          {t(submitLabel)}
        </Button>
      </Box>
    </Box>
  );
};
