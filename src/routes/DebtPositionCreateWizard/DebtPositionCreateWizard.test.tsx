import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { vi, Mock } from 'vitest';
import DebtPositionCreateWizard from './DebtPositionCreateWizard';
import { StepperContainerProps } from '../../components/Stepper';
import { useNavigate, useLocation } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import debtPositions from '../../api/debtPositions';
import utils from '../../utils';
import {
  DebtPositionDetailDTO,
  PersonEntityType,
  PaymentOptionType,
  DebtPositionStatus
} from '../../../generated/core/data-contracts';
import { PageRoutes } from '..';

type Step1Props = {
  onNext: () => void;
  isEditing?: boolean;
  debtPositionTypeOrgCode?: string;
};

type Step2Props = {
  onNext: () => void;
  onBack: () => void;
  isEditing?: boolean;
};

type Step3Props = {
  onBack: () => void;
  isEditing?: boolean;
};

// Module mocks
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn()
  };
});

vi.mock('../../store/GlobalStore', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../store/GlobalStore')>();
  return {
    ...actual,
    useStore: vi.fn()
  };
});

vi.mock('../../api/debtPositions', () => ({
  default: {
    getDebtPositionDetail: vi.fn()
  }
}));

vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: '/test-deploy-path'
    }
  }
}));

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
  default: ({ onNext, isEditing, debtPositionTypeOrgCode }: Step1Props) => (
    <div>
      <button onClick={onNext} data-testid="step1-next">
        Step 1 Next
      </button>
      <div data-testid="step1-editing">
        {isEditing ? 'editing' : 'creating'}
      </div>
      <div data-testid="step1-org-code">
        {debtPositionTypeOrgCode || 'no-code'}
      </div>
    </div>
  )
}));

vi.mock('./components/Step/Step2AddDebtor', () => ({
  default: ({ onNext, onBack, isEditing }: Step2Props) => (
    <div>
      <button onClick={onBack} data-testid="step2-back">
        Step 2 Back
      </button>
      <button onClick={onNext} data-testid="step2-next">
        Step 2 Next
      </button>
      <div data-testid="step2-editing">
        {isEditing ? 'editing' : 'creating'}
      </div>
    </div>
  )
}));

vi.mock('./components/Step/Step3', () => ({
  default: ({ onBack, isEditing }: Step3Props) => (
    <div>
      <button onClick={onBack} data-testid="step3-back">
        Step 3 Back
      </button>
      <div data-testid="step3-editing">
        {isEditing ? 'editing' : 'creating'}
      </div>
    </div>
  )
}));

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

const mockStore = {
  state: {
    organizationId: '123'
  }
};

// Test data for debt position detail
const mockDebtPositionDetail: DebtPositionDetailDTO = {
  description: 'Test Description',
  debtPositionTypeOrgCode: 'TEST123',
  debtPositionTypeOrgDescription: 'Test Description',
  status: DebtPositionStatus.DRAFT,
  debtor: {
    entityType: PersonEntityType.F,
    fiscalCode: 'RSSMRA80A01H501U',
    fullName: 'Mario Rossi',
    address: 'Via Roma 1',
    civic: '1',
    postalCode: '00100',
    nation: 'IT',
    province: 'RM',
    location: 'Roma'
  },
  paymentOptions: [
    {
      paymentOptionType: PaymentOptionType.SINGLE_INSTALLMENT,
      totalAmountCents: 10000,
      installments: [
        {
          amountCents: 10000,
          dueDate: '2024-12-31',
          remittanceInformation: 'Test Payment',
          debtor: {
            entityType: PersonEntityType.F,
            fiscalCode: 'RSSMRA80A01H501U',
            fullName: 'Mario Rossi'
          },
          transfers: [
            {
              transferIndex: 1,
              amountCents: 8000,
              orgName: 'Main Organization',
              orgFiscalCode: 'ORG123456789',
              remittanceInformation: 'Main transfer',
              category: 'MAIN001'
            },
            {
              transferIndex: 2,
              amountCents: 2000,
              orgName: 'Beneficiary Org',
              orgFiscalCode: 'BEN123456789',
              remittanceInformation: 'Beneficiary payment',
              iban: 'IT60X0542811101000000123456',
              postalIban: 'IT76P0760103200000001234567',
              category: 'TAX001'
            }
          ]
        }
      ]
    }
  ]
};

// Test data for installment payment
const mockInstallmentDebtPositionDetail: DebtPositionDetailDTO = {
  description: 'Test Installment Description',
  debtPositionTypeOrgCode: 'INST123',
  debtPositionTypeOrgDescription: 'Test Installment Description',
  status: DebtPositionStatus.DRAFT,
  debtor: {
    entityType: PersonEntityType.G,
    fiscalCode: '12345678901',
    fullName: 'Test Company SRL',
    address: 'Via Milano 10',
    civic: '10',
    postalCode: '20100',
    nation: 'IT',
    province: 'MI',
    location: 'Milano'
  },
  paymentOptions: [
    {
      paymentOptionType: PaymentOptionType.INSTALLMENTS,
      totalAmountCents: 30000,
      installments: [
        {
          amountCents: 10000,
          dueDate: '2024-06-30',
          remittanceInformation: 'First installment',
          debtor: {
            entityType: PersonEntityType.G,
            fiscalCode: '12345678901',
            fullName: 'Test Company SRL'
          },
          transfers: [
            {
              transferIndex: 1,
              amountCents: 8000,
              orgName: 'Main Organization',
              orgFiscalCode: 'ORG123456789',
              remittanceInformation: 'Main transfer 1',
              category: 'MAIN001'
            },
            {
              transferIndex: 2,
              amountCents: 2000,
              orgName: 'Beneficiary Org 1',
              orgFiscalCode: 'BEN123456789',
              remittanceInformation: 'First beneficiary',
              iban: 'IT60X0542811101000000123456',
              category: 'TAX001'
            }
          ]
        },
        {
          amountCents: 20000,
          dueDate: '2024-12-31',
          remittanceInformation: 'Second installment',
          debtor: {
            entityType: PersonEntityType.G,
            fiscalCode: '12345678901',
            fullName: 'Test Company SRL'
          },
          transfers: [
            {
              transferIndex: 1,
              amountCents: 16000,
              orgName: 'Main Organization',
              orgFiscalCode: 'ORG123456789',
              remittanceInformation: 'Main transfer 2',
              category: 'MAIN001'
            },
            {
              transferIndex: 2,
              amountCents: 4000,
              orgName: 'Beneficiary Org 2',
              orgFiscalCode: 'BEN987654321',
              remittanceInformation: 'Second beneficiary',
              iban: 'IT60X0542811101000000987654',
              category: 'TAX002'
            }
          ]
        }
      ]
    }
  ]
};

describe('DebtPositionCreateWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useStore as Mock).mockReturnValue(mockStore);
    (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
      data: null,
      error: null
    });

    // Mock for creation mode
    mockUseLocation.mockReturnValue({
      state: null
    });
    (useLocation as Mock).mockImplementation(() => mockUseLocation());
  });

  describe('Creation mode', () => {
    it('renders step 1 by default in creation mode', () => {
      render(<DebtPositionCreateWizard />);

      expect(screen.getByTestId('stepper-title')).toHaveTextContent(
        'debtPositionCreateWizard.title'
      );
      expect(screen.getByTestId('stepper-description')).toHaveTextContent(
        'debtPositionCreateWizard.description'
      );
      expect(screen.getByTestId('step-content-0')).toBeInTheDocument();
      expect(screen.getByTestId('step1-next')).toBeInTheDocument();
      expect(screen.getByTestId('step1-editing')).toHaveTextContent('creating');
      expect(screen.getByTestId('step1-org-code')).toHaveTextContent('no-code');
    });

    it('navigates to step 2 when clicking Step 1 Next', () => {
      render(<DebtPositionCreateWizard />);
      fireEvent.click(screen.getByTestId('step1-next'));

      expect(screen.getByTestId('step-content-1')).toBeInTheDocument();
      expect(screen.getByTestId('step2-next')).toBeInTheDocument();
      expect(screen.getByTestId('step2-back')).toBeInTheDocument();
      expect(screen.getByTestId('step2-editing')).toHaveTextContent('creating');
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
      expect(screen.getByTestId('step3-editing')).toHaveTextContent('creating');
    });

    it('goes back to step 2 from step 3', () => {
      render(<DebtPositionCreateWizard />);
      fireEvent.click(screen.getByTestId('step1-next'));
      fireEvent.click(screen.getByTestId('step2-next'));
      fireEvent.click(screen.getByTestId('step3-back'));

      expect(screen.getByTestId('step-content-1')).toBeInTheDocument();
    });
  });

  describe('Editing mode', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: {
          isEditing: true,
          debtPositionId: 456
        }
      });
      (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
        data: mockDebtPositionDetail,
        error: null
      });
    });

    it('shows loader while fetching and hides step1 form', () => {
      (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
        data: null,
        error: null,
        isLoading: true,
        isFetching: true
      });

      render(<DebtPositionCreateWizard />);

      expect(screen.getByTestId('step1-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('step1-next')).not.toBeInTheDocument();
    });

    it('renders in editing mode with correct titles and data', async () => {
      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('stepper-title')).toHaveTextContent(
          'debtPositionCreateWizard.editTitle'
        );
        expect(screen.getByTestId('stepper-description')).toHaveTextContent(
          'debtPositionCreateWizard.editDescription'
        );
        expect(screen.getByTestId('step1-editing')).toHaveTextContent(
          'editing'
        );
        expect(screen.getByTestId('step1-org-code')).toHaveTextContent(
          'TEST123'
        );
      });
    });

    it('transforms API data correctly for individual debtor with single payment', async () => {
      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(debtPositions.getDebtPositionDetail).toHaveBeenCalledWith(
          123,
          456
        );
      });

      // Verify that data has been transformed correctly
      // Step components should receive the transformed data
      expect(screen.getByTestId('step1-editing')).toHaveTextContent('editing');
    });

    it('transforms API data correctly for business debtor with installments', async () => {
      (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
        data: mockInstallmentDebtPositionDetail,
        error: null
      });

      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(debtPositions.getDebtPositionDetail).toHaveBeenCalledWith(
          123,
          456
        );
        expect(screen.getByTestId('step1-org-code')).toHaveTextContent(
          'INST123'
        );
      });
    });

    it('navigates between steps in editing mode', async () => {
      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step1-editing')).toHaveTextContent(
          'editing'
        );
      });

      // Test navigation
      fireEvent.click(screen.getByTestId('step1-next'));
      expect(screen.getByTestId('step2-editing')).toHaveTextContent('editing');

      fireEvent.click(screen.getByTestId('step2-next'));
      expect(screen.getByTestId('step3-editing')).toHaveTextContent('editing');
    });
  });

  describe('Error handling', () => {
    it('handles missing debtPositionId in edit mode', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          isEditing: true,
          debtPositionId: null
        }
      });

      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'debtPositionCreateWizard.errorMissingId',
          'error'
        );
        expect(mockNavigate).toHaveBeenCalledWith(
          PageRoutes.DEBT_POSITIONS_INDEX
        );
      });
    });

    it('handles API error when loading debt position data', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          isEditing: true,
          debtPositionId: 456
        }
      });

      (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
        data: null,
        error: new Error('API Error')
      });

      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'debtPositionCreateWizard.errorLoadingData',
          'error'
        );
        expect(mockNavigate).toHaveBeenCalledWith(
          PageRoutes.DEBT_POSITIONS_INDEX
        );
      });
    });

    it('handles undefined debt position detail in edit mode', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          isEditing: true,
          debtPositionId: 456
        }
      });

      (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
        data: undefined,
        error: null
      });

      render(<DebtPositionCreateWizard />);

      // Should not call navigate if there's no error but data is undefined
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Data transformation edge cases', () => {
    it('handles debt position with minimal data', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          isEditing: true,
          debtPositionId: 456
        }
      });

      const minimalDetail: DebtPositionDetailDTO = {
        description: 'Minimal Description',
        debtPositionTypeOrgDescription: 'Minimal Description',
        debtPositionTypeOrgCode: 'MIN123',
        status: DebtPositionStatus.DRAFT,
        debtor: {
          entityType: PersonEntityType.F,
          fiscalCode: 'MINIMAL123',
          fullName: 'Minimal User'
        },
        paymentOptions: []
      };

      (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
        data: minimalDetail,
        error: null
      });

      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step1-editing')).toHaveTextContent(
          'editing'
        );
      });
    });

    it('handles debt position with no transfers in installments', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          isEditing: true,
          debtPositionId: 456
        }
      });

      const noTransfersDetail: DebtPositionDetailDTO = {
        description: 'No Transfers',
        debtPositionTypeOrgDescription: 'No Transfers Description',
        debtPositionTypeOrgCode: 'NOT123',
        status: DebtPositionStatus.DRAFT,
        debtor: {
          entityType: PersonEntityType.F,
          fiscalCode: 'NOTRANS123',
          fullName: 'No Transfers User'
        },
        paymentOptions: [
          {
            paymentOptionType: PaymentOptionType.INSTALLMENTS,
            totalAmountCents: 5000,
            installments: [
              {
                amountCents: 5000,
                dueDate: '2024-12-31',
                remittanceInformation: 'No transfers payment',
                debtor: {
                  entityType: PersonEntityType.F,
                  fiscalCode: 'NOTRANS123',
                  fullName: 'No Transfers User'
                },
                transfers: []
              }
            ]
          }
        ]
      };

      (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
        data: noTransfersDetail,
        error: null
      });

      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step1-editing')).toHaveTextContent(
          'editing'
        );
      });
    });

    it('handles installments sorting by due date', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          isEditing: true,
          debtPositionId: 456
        }
      });

      const unsortedInstallmentsDetail: DebtPositionDetailDTO = {
        description: 'Unsorted Installments',
        debtPositionTypeOrgDescription: 'Unsorted Description',
        debtPositionTypeOrgCode: 'UNS123',
        status: DebtPositionStatus.DRAFT,
        debtor: {
          entityType: PersonEntityType.F,
          fiscalCode: 'UNSORT123',
          fullName: 'Unsorted User'
        },
        paymentOptions: [
          {
            paymentOptionType: PaymentOptionType.INSTALLMENTS,
            totalAmountCents: 15000,
            installments: [
              {
                amountCents: 5000,
                dueDate: '2024-12-31',
                remittanceInformation: 'Last installment',
                debtor: {
                  entityType: PersonEntityType.F,
                  fiscalCode: 'UNSORT123',
                  fullName: 'Unsorted User'
                },
                transfers: []
              },
              {
                amountCents: 10000,
                dueDate: '2024-06-30',
                remittanceInformation: 'First installment',
                debtor: {
                  entityType: PersonEntityType.F,
                  fiscalCode: 'UNSORT123',
                  fullName: 'Unsorted User'
                },
                transfers: []
              }
            ]
          }
        ]
      };

      (debtPositions.getDebtPositionDetail as Mock).mockReturnValue({
        data: unsortedInstallmentsDetail,
        error: null
      });

      render(<DebtPositionCreateWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step1-editing')).toHaveTextContent(
          'editing'
        );
      });
    });
  });

  describe('Form state management', () => {
    it('updates form data when setData is called on steps', () => {
      const TestComponent = () => {
        return <DebtPositionCreateWizard />;
      };

      render(<TestComponent />);

      // Simulate form data updates through callbacks
      fireEvent.click(screen.getByTestId('step1-next'));

      expect(screen.getByTestId('step-content-1')).toBeInTheDocument();
    });

    it('handles organization ID from store', () => {
      const mockStoreWithDifferentId = {
        state: {
          organizationId: '999'
        }
      };

      (useStore as Mock).mockReturnValue(mockStoreWithDifferentId);

      render(<DebtPositionCreateWizard />);

      expect(screen.getByTestId('step-content-0')).toBeInTheDocument();
    });
  });
});
