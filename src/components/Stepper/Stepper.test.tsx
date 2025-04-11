import { render, screen } from '@testing-library/react';
import { Stepper } from './types';
import { vi } from 'vitest';
import { StepperContainer } from '../Stepper';

vi.mock('./StepBar', () => ({
  StepBar: ({
    activeStep,
    steps
  }: {
    activeStep: number;
    steps: Stepper['steps'];
  }) => (
    <div data-testid="mock-stepbar">
      StepBar Active: {activeStep}, Steps: {steps.length}
    </div>
  )
}));

vi.mock('../TitleComponent/TitleComponent', () => ({
  default: ({
    title,
    description
  }: {
    title: string;
    description?: string;
  }) => (
    <div data-testid="mock-title">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}));

describe('StepperContainer', () => {
  const steps: Stepper['steps'] = [
    { label: 'Step 1', content: <div>Step 1 Content</div> },
    { label: 'Step 2', content: <div>Step 2 Content</div> }
  ];

  it('renders title and description', () => {
    render(
      <StepperContainer
        activeStep={0}
        steps={steps}
        title="Test Title"
        description="Test Description"
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Test Title' })
    ).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders StepBar with correct props', () => {
    render(
      <StepperContainer activeStep={1} steps={steps} title="Another Title" />
    );

    expect(screen.getByTestId('mock-stepbar')).toHaveTextContent(
      'StepBar Active: 1, Steps: 2'
    );
  });

  it('sets correct display and visibility properties for steps', () => {
    render(
      <StepperContainer activeStep={0} steps={steps} title="Visibility Test" />
    );

    const step1 = screen.getByTestId('step-0');
    const step2 = screen.getByTestId('step-1');

    expect(step1).toHaveStyle({
      display: 'flex',
      visibility: 'visible'
    });

    expect(step2).toHaveStyle({
      display: 'none',
      visibility: 'hidden'
    });
  });
});
