import { Alert, AlertProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

type ErrorMessageProps = {
  variant?: AlertProps['variant'];
  testId?: string;
};

export const ErrorMessage = ({
  variant = 'standard',
  testId = 'alert-filter-error'
}: ErrorMessageProps) => {
  const { t } = useTranslation();

  return (
    <Alert severity="error" variant={variant} data-testid={testId}>
      {t('commons.filters.atLeastOneFilter')}
    </Alert>
  );
};
