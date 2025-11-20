import { ArrowBack } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { useSmartBack } from '../../hooks/useSmartBack';

export type BackButtonProps = {
  text?: string;
  onClick?: () => void;
  /**
   * Fallback route (full path) for smart back.
   * If the history does not contain valid pages, navigates to this route.
   *
   * @example '/piattaformaunitaria/backoffice/client-sil'
   */
  fallbackRoute?: string;
  /**
   * Enables smart back navigation that automatically skips
   * consecutive success pages in history.
   * Default: true
   *
   * Set to false to use the legacy behavior (navigate -1 or -2)
   */
  enableSmartBack?: boolean;
};

export const BackButton = (props: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const {
    text = t('commons.back'),
    onClick,
    fallbackRoute,
    enableSmartBack = true
  } = props;

  // Check if there is history available
  // If location.key === 'default' but there is history in the browser, it might be
  // that the history has been modified directly (e.g. pushState) without React Router
  const hasReactRouterHistory =
    location.key !== 'default' && window.history.length > 1;
  const hasBrowserHistory = window.history.length > 1;
  const hasHistory = hasReactRouterHistory || hasBrowserHistory;
  // If location.key is 'default', use window.history.back() instead of navigate
  const useBrowserHistory = location.key === 'default' && hasBrowserHistory;

  const { handleSmartBack } = useSmartBack({
    fallbackRoute
  });

  if (!hasHistory) {
    return null;
  }

  /**
   * Handles the back navigation.
   *
   * If enableSmartBack is true (default), uses the useSmartBack hook which:
   * - Automatically skips all consecutive success pages
   * - Uses the fallbackRoute if the history is not valid
   * - Has a safety cap to avoid infinite loops
   *
   * If enableSmartBack is false, uses the legacy behavior which:
   * - Skips only one success page (navigate -2)
   * - Otherwise does navigate(-1)
   */
  const handleBack = () => {
    // If location.key is 'default', it means that React Router did not track this entry
    // (probably because the history has been modified directly with pushState)
    // In this case, use window.history.back() directly
    if (useBrowserHistory) {
      window.history.back();
      return;
    }

    if (enableSmartBack) {
      handleSmartBack();
    } else {
      // Fallback to legacy behavior for backward compatibility
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
    }
  };

  return (
    <Button
      role="button"
      aria-label={text}
      size="medium"
      startIcon={<ArrowBack />}
      variant="text"
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          handleBack();
        }
      }}
      sx={{ marginBottom: 3, paddingLeft: 0 }}
    >
      {text}
    </Button>
  );
};
