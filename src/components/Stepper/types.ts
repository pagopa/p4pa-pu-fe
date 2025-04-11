import { ReactNode } from 'react';

export type Stepper = {
  activeStep: number;
  steps: Array<{
    label: string;
    optional?: boolean;
    content: ReactNode;
  }>;
};
