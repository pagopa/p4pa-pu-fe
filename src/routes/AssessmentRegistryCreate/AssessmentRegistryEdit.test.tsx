import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssessmentRegistryEdit } from './AssessmentRegistryEdit';

const {
  mockMutateAsync,
  mockGetAssessmentsRegistry,
  mockUpdateAssessmentsRegistry
} = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockGetAssessmentsRegistry: vi.fn(),
  mockUpdateAssessmentsRegistry: vi.fn()
}));

vi.mock('../../api/assessments', () => ({
  getAssessmentsRegistry: (...args: Array<unknown>) =>
    mockGetAssessmentsRegistry(...args),
  updateAssessmentsRegistry: (...args: Array<unknown>) =>
    mockUpdateAssessmentsRegistry(...args)
}));

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ assessmentRegistryId: '42' })
  };
});

vi.mock('../../routes', () => ({
  PageRoutes: {
    RESPONSES_SUCCESS: '/success',
    RESPONSES_ERROR: '/error'
  }
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: { organizationId: '123' }
  }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../components/Wizard/WizardStepButtons', () => ({
  default: ({
    onBack,
    onNext,
    nextLabel,
    backLabel
  }: {
    onBack: () => void;
    onNext: () => void;
    nextLabel: string;
    backLabel: string;
  }) => (
    <div data-testid="wizard-step-buttons">
      <button data-testid="back-button" onClick={onBack}>
        {backLabel}
      </button>
      <button data-testid="next-button" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  )
}));

describe('AssessmentRegistryEdit', () => {
  const existingRegistry = {
    assessmentRegistryId: 42,
    debtPositionTypeOrgCode: 'TYPE1',
    status: 'ACTIVE',
    operatingYear: '2024',
    sectionCode: 'SC01',
    sectionDescription: 'Capitolo A',
    officeCode: 'OFF01',
    officeDescription: 'Ufficio 1',
    assessmentCode: 'AC01',
    assessmentDescription: 'Accertamento 1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAssessmentsRegistry.mockReturnValue({ data: existingRegistry });
    mockUpdateAssessmentsRegistry.mockReturnValue({
      mutateAsync: mockMutateAsync
    });
  });

  const renderComponent = () => render(<AssessmentRegistryEdit />);

  it('renders the form', () => {
    renderComponent();
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('submits and navigates to success with correct state', async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    renderComponent();

    const nextBtn = await screen.findByTestId('next-button');
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: '123',
          assessmentRegistryId: 42,
          debtPositionTypeOrgCode: 'TYPE1',
          operatingYear: '2024'
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/success', {
      replace: true,
      state: {
        category: 'assessment-registry-update',
        assessmentRegistryId: 42,
        i18nParams: { paymentObject: 'Capitolo A' }
      }
    });
  });

  it('navigates to error on submit failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('update failed'));

    renderComponent();

    const nextBtn = await screen.findByTestId('next-button');
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/error');
    });
  });
});
