import { CircularProgress, Stack, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import WizardStepWrapper from '../Wizard/WizardStepWrapper';

type WizardStepLoaderProps = {
  title?: string;
  subtitle?: string;
  messageKey?: string;
  minHeight?: number;
  'data-testid'?: string;
};

function WizardStepLoader({
  title,
  subtitle,
  messageKey = 'commons.loading',
  minHeight = 200,
  'data-testid': dataTestId = 'wizard-step-loader'
}: PropsWithChildren<WizardStepLoaderProps>) {
  const { t } = useTranslation();

  return (
    <WizardStepWrapper title={title} subtitle={subtitle}>
      <Stack
        alignItems="center"
        justifyContent="center"
        minHeight={minHeight}
        gap={2}
        aria-busy
        role="status"
        data-testid={dataTestId}
      >
        <CircularProgress aria-hidden />
        <Typography variant="body2" aria-live="polite">
          {t(messageKey)}
        </Typography>
      </Stack>
    </WizardStepWrapper>
  );
}

export default WizardStepLoader;
