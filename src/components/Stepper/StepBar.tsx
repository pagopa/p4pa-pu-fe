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

type StepState = {
  isCompleted: boolean;
  isActive: boolean;
};

const getStepState = (index: number, activeStep: number): StepState => ({
  isCompleted: index < activeStep,
  isActive: index === activeStep
});

export const StepBar = ({ activeStep, steps }: StepBarProps) => {
  const { t } = useTranslation();

  const buildStepAriaLabel = (
    index: number,
    label: string,
    optional: boolean | undefined,
    state: StepState
  ): string => {
    const position = t('commons.stepper.position', {
      current: index + 1,
      total: steps.length
    });

    const optionalLabel = optional ? t('commons.optional') : '';

    const completionLabel = state.isCompleted
      ? t('commons.stepper.status.completed')
      : '';

    const activationLabel = state.isActive
      ? t('commons.stepper.status.active')
      : t('commons.stepper.status.inactive');

    return [position, label, optionalLabel, completionLabel, activationLabel]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <nav aria-label={t('commons.stepper.navigationLabel')}>
      <MuiStepper
        alternativeLabel
        activeStep={activeStep}
        data-testid="stepbar"
        component="ol"
        sx={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}
      >
        {steps.map(({ label, optional }, index) => {
          const state = getStepState(index, activeStep);
          const ariaLabel = buildStepAriaLabel(index, label, optional, state);

          return (
            <Step
              key={label}
              component="li"
              aria-label={ariaLabel}
              aria-current={state.isActive ? 'step' : undefined}
              sx={{ listStyle: 'none' }}
            >
              <Stack alignItems="center">
                <StepLabel aria-hidden="true">{label}</StepLabel>
                {optional ? (
                  <Typography variant="caption" aria-hidden="true">
                    {t('commons.optional')}
                  </Typography>
                ) : null}
              </Stack>
            </Step>
          );
        })}
      </MuiStepper>
    </nav>
  );
};
