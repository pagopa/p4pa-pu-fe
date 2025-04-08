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

  it('renders all steps in DOM but only shows the active step', () => {
    const { container } = render(
      <StepperContainer activeStep={1} steps={steps} title="Step Test" />
    );

    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();

    const stepContainers = container.querySelectorAll('[aria-hidden]');
    expect(stepContainers.length).toBe(2);

    expect(stepContainers[0]).toHaveAttribute('aria-hidden', 'true');

    expect(stepContainers[1]).toHaveAttribute('aria-hidden', 'false');
  });

  it('sets correct display and visibility properties for steps', () => {
    const { container } = render(
      <StepperContainer activeStep={0} steps={steps} title="Visibility Test" />
    );

    const stepContainers = container.querySelectorAll('[aria-hidden]');

    expect(stepContainers[0]).toHaveStyle({
      display: 'flex',
      visibility: 'visible'
    });

    expect(stepContainers[1]).toHaveStyle({
      display: 'none',
      visibility: 'hidden'
    });
  });
});
