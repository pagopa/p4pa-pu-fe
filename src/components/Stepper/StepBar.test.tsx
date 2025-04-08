import { render, screen } from '@testing-library/react';
import { StepBar } from './StepBar';
import type { Stepper } from './types';
import { vi } from 'vitest';

// mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key // just return the key
  })
}));

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

    // Since we mock `t`, the optional text should be the translation key
    expect(screen.getByText('commons.optional')).toBeInTheDocument();
  });
});
