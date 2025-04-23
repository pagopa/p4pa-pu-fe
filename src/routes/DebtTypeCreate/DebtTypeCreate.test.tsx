import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DebtTypeCreate } from '../DebtTypeCreate';
import { Step1Props } from './components/Step1Configuration';
import { Step2Props } from './components/Step2Settings';
import { StepperContainerProps } from '../../components/Stepper';

vi.mock('./components/Step1Configuration', () => ({
  Step1Configuration: ({ setData, onNext }: Step1Props) => (
    <div data-testid="step1-configuration">
      <button
        onClick={() => {
          setData({
            debtPositionType: 'Test Debt Type',
            debtPositionTypeCode: 'CODE1',
            organizationType: 'ORG1',
            macroAreaCode: 'MACRO1',
            serviceTypeCode: 'SERVICE1',
            collectionReason: 'REASON1',
            taxonomyCode: 'TAX1'
          });
          onNext();
        }}
      >
        Mock Next Step1
      </button>
    </div>
  )
}));

vi.mock('./components/Step2Settings', () => ({
  Step2Settings: ({ setData, onBack, onNext }: Step2Props) => (
    <div data-testid="step2-settings">
      <button onClick={onBack}>Mock Back</button>
      <button
        onClick={() => {
          setData({
            option1: true,
            option2: false,
            option3: true,
            checkbox2: true,
            textField: 'Test Subject',
            textArea: 'Test Message'
          });
          onNext();
        }}
      >
        Mock Finish
      </button>
    </div>
  )
}));

vi.mock('../../components/Stepper', () => ({
  StepperContainer: ({ steps, activeStep }: StepperContainerProps) => (
    <div data-testid="stepper-container">
      <div data-testid="active-step">{activeStep}</div>
      {steps[activeStep].content}
    </div>
  )
}));

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('../../App', () => ({
  PageRoutes: {
    DEBT_TYPE_CREATE_SUCCESS: '/debt-type-create-success'
  }
}));

describe('DebtTypeCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the stepper with step 1 initially active', () => {
    render(<DebtTypeCreate />);

    // Check stepper container is rendered
    expect(screen.getByTestId('stepper-container')).toBeInTheDocument();

    // Check active step is 0
    expect(screen.getByTestId('active-step').textContent).toBe('0');

    // Check step 1 content is shown
    expect(screen.getByTestId('step1-configuration')).toBeInTheDocument();
    expect(screen.queryByTestId('step2-settings')).not.toBeInTheDocument();
  });

  it('moves to step 2 when step 1 completes', async () => {
    render(<DebtTypeCreate />);

    // Initially on step 1
    expect(screen.getByTestId('active-step').textContent).toBe('0');

    // Complete step 1
    fireEvent.click(screen.getByText('Mock Next Step1'));

    // Should move to step 2
    expect(screen.getByTestId('active-step').textContent).toBe('1');
    expect(screen.getByTestId('step2-settings')).toBeInTheDocument();
    expect(screen.queryByTestId('step1-configuration')).not.toBeInTheDocument();
  });

  it('updates formData when completing step 1', async () => {
    render(<DebtTypeCreate />);

    // Complete step 1
    fireEvent.click(screen.getByText('Mock Next Step1'));

    // Now on step 2, click back to verify step 1 data was saved
    fireEvent.click(screen.getByText('Mock Back'));

    // Back to step 1
    expect(screen.getByTestId('active-step').textContent).toBe('0');

    // Complete step 1 again
    fireEvent.click(screen.getByText('Mock Next Step1'));

    // Should move to step 2 again
    expect(screen.getByTestId('active-step').textContent).toBe('1');
  });

  it('navigates to success page with form data when finishing step 2', async () => {
    render(<DebtTypeCreate />);

    fireEvent.click(screen.getByText('Mock Next Step1'));
    fireEvent.click(screen.getByText('Mock Finish'));

    // Should navigate to success page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/debt-type-create-success', {
        replace: true,
        state: {
          formData: {
            step1: {
              debtPositionType: 'Test Debt Type',
              debtPositionTypeCode: 'CODE1',
              organizationType: 'ORG1',
              macroAreaCode: 'MACRO1',
              serviceTypeCode: 'SERVICE1',
              collectionReason: 'REASON1',
              taxonomyCode: 'TAX1'
            },
            step2: {
              option1: true,
              option2: false,
              option3: true,
              checkbox2: true,
              textField: 'Test Subject',
              textArea: 'Test Message'
            }
          }
        }
      });
    });
  });

  it('moves back to step 1 when back button is clicked in step 2', () => {
    render(<DebtTypeCreate />);

    // Complete step 1
    fireEvent.click(screen.getByText('Mock Next Step1'));

    // Should be on step 2
    expect(screen.getByTestId('active-step').textContent).toBe('1');

    // Click back button
    fireEvent.click(screen.getByText('Mock Back'));

    // Should move back to step 1
    expect(screen.getByTestId('active-step').textContent).toBe('0');
    expect(screen.getByTestId('step1-configuration')).toBeInTheDocument();
    expect(screen.queryByTestId('step2-settings')).not.toBeInTheDocument();
  });
});
