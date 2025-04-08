import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import Step3 from './Step3';

// Helper to render component with providers
const renderStep3 = (
  props: Partial<React.ComponentProps<typeof Step3>> = {}
) => {
  const defaultProps = {
    data: {
      paymentObject: { value: '', readonly: false },
      paymentOption: { value: '', readonly: false },
      amount: { value: '', readonly: false },
      dueDate: { value: null, readonly: false },
      flagMandatoryDueDate: false,
      isMultibeneficiary: { value: false, readonly: false }
    },
    setData: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
    ...props
  };

  return render(<Step3 {...defaultProps} />);
};

describe('Step3 Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    renderStep3();

    expect(
      screen.getByRole('textbox', {
        name: 'debtPositionCreateWizard.step3.paymentObject.label'
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('combobox', {
        name: 'debtPositionCreateWizard.step3.paymentOption.label'
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('spinbutton', {
        name: 'debtPositionCreateWizard.step3.amount.label'
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', {
        name: 'debtPositionCreateWizard.step3.dueDate.label'
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('checkbox', {
        name: 'debtPositionCreateWizard.step3.isMultibeneficiary.label'
      })
    ).toBeInTheDocument();
  });

  it('displays errors for required fields on submit', async () => {
    renderStep3();

    fireEvent.click(screen.getByRole('button', { name: 'commons.create' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'debtPositionCreateWizard.step3.paymentObject.required'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'debtPositionCreateWizard.step3.paymentOption.required'
        )
      ).toBeInTheDocument();
    });
  });
});
