import Stack from '@mui/material/Stack';
import TitleComponent from '../TitleComponent/TitleComponent';
import { Stepper } from './types';
import { StepBar } from './StepBar';

export type StepperContainerProps = Stepper & {
  title: string;
  description?: string;
};

export const StepperContainer = ({
  activeStep,
  steps,
  title,
  description
}: StepperContainerProps) => {
  return (
    <Stack
      my={4}
      gap={1}
      justifyContent="center"
      data-testid="stepper-container"
    >
      <TitleComponent title={title} description={description} />
      <Stack gap={3} pt={1} justifyContent="center">
        <StepBar activeStep={activeStep} steps={steps} />
        {steps.map((step, index) =>
          activeStep === index ? (
            <Stack data-testid={`step-${index}`} key={step.label}>
              {step.content}
            </Stack>
          ) : (
            <Stack
              data-testid={`step-${index}`}
              key={step.label}
              sx={{
                height: 0,
                minHeight: 0,
                maxHeight: 0,
                overflow: 'hidden',
                visibility: 'hidden',
                '& > *': {
                  visibility: 'hidden'
                }
              }}
            >
              {step.content}
            </Stack>
          )
        )}
      </Stack>
    </Stack>
  );
};
