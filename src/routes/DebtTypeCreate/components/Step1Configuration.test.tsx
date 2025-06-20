import { vi } from 'vitest';
import { z } from 'zod';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { Step1Configuration } from './Step1Configuration';

// Mock taxonomySchema to exclude taxonomy fields from validation in this test
vi.mock('../../../components/TaxonomyFilter/schema', () => ({
  taxonomySchema: z.object({})
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
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders TaxonomyFilter when not in edit mode', () => {
    render(
      <Step1Configuration
        onBack={mockOnBack}
        setData={mockSetData}
        onNext={mockOnNext}
      />
    );

    expect(screen.getByTestId('taxonomy-filter')).toBeInTheDocument();
    expect(screen.queryByTestId('taxonomy-edit')).not.toBeInTheDocument();
  });

  it('renders TaxonomyEdit when in edit mode', () => {
    render(
      <Step1Configuration
        onBack={mockOnBack}
        setData={mockSetData}
        onNext={mockOnNext}
        editmode={true}
      />
    );

    expect(screen.getByTestId('taxonomy-edit')).toBeInTheDocument();
    expect(screen.queryByTestId('taxonomy-filter')).not.toBeInTheDocument();
  });

  it('shows validation errors if form is submitted empty', async () => {
    render(
      <Step1Configuration
        onBack={mockOnBack}
        setData={mockSetData}
        onNext={mockOnNext}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(
        screen.getByText('debtTypeCreate.configuration.debtType.required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('debtTypeCreate.configuration.debtTypeCode.required')
      ).toBeInTheDocument();

      // Note: Taxonomy validation errors are NOT expected here due to mocked schema
    });

    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('submits form when valid values are provided', async () => {
    render(
      <Step1Configuration
        onBack={mockOnBack}
        setData={mockSetData}
        onNext={mockOnNext}
      />
    );

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'debtTypeCreate.configuration.debtTypeCode.label'
      }),
      { target: { value: 'DPT001' } }
    );
    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'debtTypeCreate.configuration.debtType.label'
      }),
      { target: { value: 'Debt Position Title' } }
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'DPT001',
          description: 'Debt Position Title'
          // Taxonomy fields are not validated or required here
        })
      );
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <Step1Configuration
        onBack={mockOnBack}
        setData={mockSetData}
        onNext={mockOnNext}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.back' }));

    expect(mockOnBack).toHaveBeenCalled();
  });
});
