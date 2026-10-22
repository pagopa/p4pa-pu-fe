import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import type AlertProps from '@mui/material/AlertProps';

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
