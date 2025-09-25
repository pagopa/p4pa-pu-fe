import { ArrowBack } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';

export type BackButtonProps = {
  text?: string;
  onClick?: () => void;
};

export const BackButton = (props: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { text = t('commons.back'), onClick } = props;

  const hasHistory = location.key !== 'default' && window.history.length > 1;

  if (!hasHistory) {
    return null;
  }
  /**
   * Handles the back navigation with smart deduplication logic.
   *
   * When success pages use `navigate(route, { replace: true })`, they create
   * duplicate consecutive entries in the browser history stack. This function
   * detects such scenarios and skips the duplicate entry by navigating -2 steps
   * instead of the standard -1, preventing navigation loops.
   *
   * @example
   * Standard flow: Detail -> Edit -> Success (replace) -> Detail (replace)
   * Browser stack becomes: [Detail, Detail] instead of [Detail, Edit, Success, Detail]
   * Without this logic: navigate(-1) would go Detail -> Detail (same page)
   * With this logic: navigate(-2) goes to the actual previous page
   */
  const handleBack = () => {
    // Check if current location comes from a success page navigation
    const comesFromSuccess =
      location.state?.fromSuccess ||
      location.state?.category?.includes('success');

    if (comesFromSuccess) {
      // Skip duplicate entry caused by replace: true navigations
      navigate(-2);
    } else {
      // Standard back navigation
      navigate(-1);
    }
  };

  return (
    <Button
      role="button"
      aria-label={text}
      size="medium"
      startIcon={<ArrowBack />}
      variant="text"
      onClick={onClick || handleBack}
      sx={{ marginBottom: 3, paddingLeft: 0 }}
    >
      {text}
    </Button>
  );
};
