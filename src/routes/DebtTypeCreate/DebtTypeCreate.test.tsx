import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { vi } from 'vitest';
import { DebtTypeCreate } from '../DebtTypeCreate';
import { Step1Props } from './components/Step1Configuration';
import { Step2Props } from './components/Step2Settings';
import { StepperContainerProps } from '../../components/Stepper';
import { PageRoutes } from '..';

vi.mock('./components/Step1Configuration', () => ({
  Step1Configuration: ({ setData, onNext }: Step1Props) => (
    <div data-testid="step1-configuration">
      <button
        onClick={() => {
          if (setData) {
            setData({
              description: 'Test Debt Type',
              code: 'CODE1',
              orgType: 'ORG1',
              macroAreaCode: 'MACRO1',
              serviceTypeCode: 'SERVICE1',
              collectingReason: 'REASON1',
              taxonomyCode: 'TAX1'
            });
          }
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
            flagMandatoryDueDate: true,
            flagAnonymousFiscalCode: false,
            flagNotifyIo: true,
            ioTemplateSubject: 'Test Subject',
            ioTemplateMessage: 'Test Message'
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

vi.mock('../../api/debtPositionsTypes', () => ({
  postDebtPositionType: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({
      description: 'Test Debt Type',
      code: 'CODE1',
      orgType: 'ORG1',
      macroArea: 'MACRO1',
      serviceType: 'SERVICE1',
      collectingReason: 'REASON1',
      taxonomyCode: 'TAX1',
      flagMandatoryDueDate: true,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: true,
      ioTemplateSubject: 'Test Subject',
      ioTemplateMessage: 'Test Message'
    })
  }))
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('../../App', () => ({
  PageRoutes: {
    RESPONSES_SUCCESS: '/success'
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
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'debt-type-catalog-create',
          i18nParams: {
            paymentObject: 'Test Debt Type'
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
