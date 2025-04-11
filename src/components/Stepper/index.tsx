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
    <Stack my={4} gap={1} justifyContent="center">
      <TitleComponent title={title} description={description} />
      <Stack gap={3} pt={1} justifyContent="center">
        <StepBar activeStep={activeStep} steps={steps} />
        {steps.map((step, index) => (
          <Stack
            key={step.label}
            display={activeStep === index ? 'flex' : 'none'}
            visibility={activeStep === index ? 'visible' : 'hidden'}
          >
            {step.content}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
