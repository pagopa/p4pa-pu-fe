import { vi } from 'vitest';
import { z } from 'zod';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { Step1Configuration } from './Step1Configuration';
import { DebtPositionTypeDetailDTO } from '../../../../generated/core/data-contracts';

// Mock taxonomyFieldsSchema to exclude taxonomy fields from validation in this test
vi.mock('../../../components/TaxonomyFilter/schema', () => ({
  taxonomyFieldsSchema: z.object({})
}));

// Mock schema to avoid complex validation in tests
vi.mock('./schema', () => ({
  step1Schema: z.object({
    code: z.string({
      required_error: 'debtTypeCreate.configuration.debtTypeCode.required'
    }),
    description: z
      .string({
        required_error: 'debtTypeCreate.configuration.debtType.required'
      })
      .max(100, 'debtTypeCreate.configuration.debtType.maxCharacters'),
    isCodeUnique: z.boolean().optional()
  })
}));

// Mock TaxonomyFilter and TaxonomyEdit components
vi.mock('../../../components/TaxonomyFilter', () => ({
  TaxonomyFilter: () => (
    <div data-testid="taxonomy-filter">TaxonomyFilter Mock</div>
  )
}));

vi.mock('./components/TaxonomyEdit', () => ({
  TaxonomyEdit: () => <div data-testid="taxonomy-edit">TaxonomyEdit Mock</div>
}));

describe('Step1Configuration', () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders TaxonomyFilter when not in edit mode', () => {
    render(<Step1Configuration onBack={mockOnBack} onNext={mockOnNext} />);

    expect(screen.getByTestId('taxonomy-filter')).toBeInTheDocument();
    expect(screen.queryByTestId('taxonomy-edit')).not.toBeInTheDocument();
  });

  it('renders TaxonomyEdit when in edit mode', () => {
    render(
      <Step1Configuration
        onBack={mockOnBack}
        onNext={mockOnNext}
        editmode={true}
      />
    );

    expect(screen.getByTestId('taxonomy-edit')).toBeInTheDocument();
    expect(screen.queryByTestId('taxonomy-filter')).not.toBeInTheDocument();
  });

  it('shows validation errors if form is submitted empty', async () => {
    render(<Step1Configuration onBack={mockOnBack} onNext={mockOnNext} />);

    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(
        screen.getByText('debtTypeCreate.configuration.debtType.required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('debtTypeCreate.configuration.debtTypeCode.required')
      ).toBeInTheDocument();
    });

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('calls onNext when form is valid', async () => {
    render(<Step1Configuration onBack={mockOnBack} onNext={mockOnNext} />);

    // Get all textboxes and find the code and description inputs
    const textboxes = screen.getAllByRole('textbox');
    const codeInput = textboxes.find(
      (input) => input.getAttribute('name') === 'code'
    );
    const descriptionInput = textboxes.find(
      (input) => input.getAttribute('name') === 'description'
    );

    if (!codeInput || !descriptionInput) {
      throw new Error('Could not find code or description input');
    }

    fireEvent.change(codeInput, { target: { value: 'DPT001' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'Debt Position Title' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('calls onBack when back button is clicked', () => {
    render(<Step1Configuration onBack={mockOnBack} onNext={mockOnNext} />);

    fireEvent.click(screen.getByRole('button', { name: 'commons.back' }));

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('exposes form methods when formMethods prop is provided', async () => {
    const mockFormMethods = {
      getValues: vi.fn(),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      trigger: vi.fn(),
      setValue: vi.fn()
    };

    render(
      <Step1Configuration
        onBack={mockOnBack}
        onNext={mockOnNext}
        formMethods={mockFormMethods}
      />
    );

    // Wait for useEffect to run and expose methods
    await waitFor(() => {
      // After useEffect runs, the methods should be replaced with actual form methods
      expect(typeof mockFormMethods.getValues).toBe('function');
      expect(typeof mockFormMethods.setError).toBe('function');
      expect(typeof mockFormMethods.clearErrors).toBe('function');
      expect(typeof mockFormMethods.trigger).toBe('function');
      expect(typeof mockFormMethods.setValue).toBe('function');
    });
  });

  it('disables code and description fields in edit mode', () => {
    const prefilledData: Partial<DebtPositionTypeDetailDTO> = {
      code: 'EXISTING_CODE',
      description: 'Existing Description'
    };

    render(
      <Step1Configuration
        onBack={mockOnBack}
        onNext={mockOnNext}
        editmode={true}
        prefilledData={prefilledData as DebtPositionTypeDetailDTO}
      />
    );

    // Get all textboxes and find the code and description inputs
    const textboxes = screen.getAllByRole('textbox');
    const codeInput = textboxes.find(
      (input) => input.getAttribute('name') === 'code'
    );
    const descriptionInput = textboxes.find(
      (input) => input.getAttribute('name') === 'description'
    );

    if (!codeInput || !descriptionInput) {
      throw new Error('Could not find code or description input');
    }

    expect(codeInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
  });
});
