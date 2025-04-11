import { render, screen } from '@testing-library/react';
import { StepBar } from './StepBar';
import type { Stepper } from './types';

describe('StepBar', () => {
  const steps: Stepper['steps'] = [
    { label: 'Step One', content: '' },
    { label: 'Step Two', optional: true, content: '' },
    { label: 'Step Three', content: '' }
  ];

  it('renders all steps', () => {
    render(<StepBar activeStep={1} steps={steps} />);

    expect(screen.getByText('Step One')).toBeInTheDocument();
    expect(screen.getByText('Step Two')).toBeInTheDocument();
    expect(screen.getByText('Step Three')).toBeInTheDocument();
  });

  it('shows optional text for optional steps', () => {
    render(<StepBar activeStep={0} steps={steps} />);

    expect(screen.getByText('commons.optional')).toBeInTheDocument();
  });
});
