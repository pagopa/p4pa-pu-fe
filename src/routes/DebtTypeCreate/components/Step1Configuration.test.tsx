import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('../../../api/taxonomy', () => ({
  getOrganizationsTypes: vi.fn(() => ({
    data: [{ value: 'org1', label: 'Organization 1' }],
    isLoading: false,
    isError: false,
    error: null
  })),
  getMacroAreas: vi.fn(() => ({
    data: [{ value: 'macro1', label: 'Macro Area 1' }],
    isLoading: false,
    isError: false,
    error: null
  })),
  getServiceTypes: vi.fn(() => ({
    data: [{ value: 'service1', label: 'Service Type 1' }],
    isLoading: false,
    isError: false,
    error: null
  })),
  getCollectionReasons: vi.fn(() => ({
    data: [{ value: 'reason1', label: 'Reason 1' }],
    isLoading: false,
    isError: false,
    error: null
  })),
  getTaxonomyCode: vi.fn(() => ({
    data: [{ value: 'tax1', label: 'Taxonomy 1' }],
    isLoading: false,
    isError: false,
    error: null
  }))
}));

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { Step1Configuration } from './Step1Configuration';
import { pickSelect } from '../../../__tests__/utils';

describe('Step1Configuration', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors if form is submitted empty', async () => {
    render(
      <Step1Configuration
        onBack={vi.fn()}
        setData={mockSetData}
        onNext={mockOnNext}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(
        screen.getByText('debtTypeCreate.configuration.debtType.required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('debtTypeCreate.configuration.debtTypeCode.required')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'debtTypeCreate.configuration.organizationType.required'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('debtTypeCreate.configuration.macroArea.required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('debtTypeCreate.configuration.serviceType.required')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'debtTypeCreate.configuration.collectionReason.required'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('debtTypeCreate.configuration.taxonomyCode.required')
      ).toBeInTheDocument();
    });

    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('submits form when valid values are provided', async () => {
    render(
      <Step1Configuration
        onBack={vi.fn()}
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

    await pickSelect(
      'debtTypeCreate.configuration.organizationType.label',
      'Organization 1'
    );
    await pickSelect(
      'debtTypeCreate.configuration.macroArea.label',
      'Macro Area 1'
    );
    await pickSelect(
      'debtTypeCreate.configuration.serviceType.label',
      'Service Type 1'
    );
    await pickSelect(
      'debtTypeCreate.configuration.collectionReason.label',
      'Reason 1'
    );
    await pickSelect(
      'debtTypeCreate.configuration.taxonomyCode.label',
      'Taxonomy 1'
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        code: 'DPT001',
        collectingReason: 'reason1',
        description: 'Debt Position Title',
        macroArea: 'macro1',
        orgType: 'org1',
        serviceType: 'service1',
        taxonomyCode: 'tax1'
      });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });
});
