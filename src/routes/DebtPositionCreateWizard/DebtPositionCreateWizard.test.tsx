import { render, screen, fireEvent } from '../../__tests__/renderers';
import { vi } from 'vitest';
import DebtPositionCreateWizard from './DebtPositionCreateWizard';
import { StepperContainerProps } from '../../components/Stepper';

vi.mock('../../components/Stepper', () => ({
  StepperContainer: ({
    title,
    description,
    steps,
    activeStep
  }: StepperContainerProps) => (
    <div>
      <div data-testid="stepper-title">{title}</div>
      <div data-testid="stepper-description">{description}</div>
      <div data-testid={`step-content-${activeStep}`}>
        {steps[activeStep].content}
      </div>
    </div>
  )
}));

vi.mock('./components/Step/Step1GeneralConfiguration', () => ({
  default: ({ onNext }: { onNext: () => void }) => (
    <button onClick={onNext} data-testid="step1-next">
      Step 1 Next
    </button>
  )
}));

vi.mock('./components/Step/Step2AddDebtor', () => ({
  default: ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
    <div>
      <button onClick={onBack} data-testid="step2-back">
        Step 2 Back
      </button>
      <button onClick={onNext} data-testid="step2-next">
        Step 2 Next
      </button>
    </div>
  )
}));

vi.mock('./components/Step/Step3', () => ({
  default: ({ onBack }: { onBack: () => void }) => (
    <button onClick={onBack} data-testid="step3-back">
      Step 3 Back
    </button>
  )
}));

describe('DebtPositionCreateWizard', () => {
  it('renders step 1 by default', () => {
    render(<DebtPositionCreateWizard />);
    expect(screen.getByTestId('stepper-title')).toHaveTextContent(
      'debtPositionCreateWizard.title'
    );
    expect(screen.getByTestId('stepper-description')).toHaveTextContent(
      'debtPositionCreateWizard.description'
    );
    expect(screen.getByTestId('step-content-0')).toBeInTheDocument();
    expect(screen.getByTestId('step1-next')).toBeInTheDocument();
  });

  it('navigates to step 2 when clicking Step 1 Next', () => {
    render(<DebtPositionCreateWizard />);
    fireEvent.click(screen.getByTestId('step1-next'));
    expect(screen.getByTestId('step-content-1')).toBeInTheDocument();
    expect(screen.getByTestId('step2-next')).toBeInTheDocument();
    expect(screen.getByTestId('step2-back')).toBeInTheDocument();
  });

  it('goes back to step 1 from step 2', () => {
    render(<DebtPositionCreateWizard />);
    fireEvent.click(screen.getByTestId('step1-next'));
    fireEvent.click(screen.getByTestId('step2-back'));
    expect(screen.getByTestId('step-content-0')).toBeInTheDocument();
  });

  it('navigates to step 3 from step 2', () => {
    render(<DebtPositionCreateWizard />);
    fireEvent.click(screen.getByTestId('step1-next'));
    fireEvent.click(screen.getByTestId('step2-next'));
    expect(screen.getByTestId('step-content-2')).toBeInTheDocument();
    expect(screen.getByTestId('step3-back')).toBeInTheDocument();
  });

  it('goes back to step 2 from step 3', () => {
    render(<DebtPositionCreateWizard />);
    fireEvent.click(screen.getByTestId('step1-next'));
    fireEvent.click(screen.getByTestId('step2-next'));
    fireEvent.click(screen.getByTestId('step3-back'));
    expect(screen.getByTestId('step-content-1')).toBeInTheDocument();
  });
});
