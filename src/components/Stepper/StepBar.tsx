import {
  Stepper as MuiStepper,
  Stack,
  Step,
  StepLabel,
  Typography
} from '@mui/material';
import { Stepper } from './types';
import { useTranslation } from 'react-i18next';

export type StepBarProps = Stepper;

export const StepBar = ({ activeStep, steps }: StepBarProps) => {
  const { t } = useTranslation();
  return (
    <MuiStepper alternativeLabel activeStep={activeStep}>
      {steps.map(({ label, optional }) => (
        <Step key={label}>
          <Stack alignItems="center">
            <StepLabel>{label}</StepLabel>
            {optional ? (
              <Typography variant="caption">{t('commons.optional')}</Typography>
            ) : null}
          </Stack>
        </Step>
      ))}
    </MuiStepper>
  );
};
