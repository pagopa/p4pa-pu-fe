import { useState, useCallback } from 'react';

export type UseStepperLogicProps = {
  initialStep: number;
  totalSteps: number;
};

export const useStepperLogic = ({
  initialStep,
  totalSteps
}: UseStepperLogicProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const isFirstStep = currentStep === initialStep;
  const isLastStep = currentStep === totalSteps - 1;

  return {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
    setCurrentStep
  };
};
