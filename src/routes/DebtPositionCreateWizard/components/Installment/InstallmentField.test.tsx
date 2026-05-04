import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import InstallmentField from './InstallmentField';
import { Control, FieldValues } from 'react-hook-form';
import { ReactNode } from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

type MockField = { id: string; amount: string; dueDate: null };

type HookProps = {
  control: Control<FieldValues>;
  fieldNamePrefix: string;
  isSubmitted: boolean;
  getValues: unknown;
  setValue: unknown;
  trigger: unknown;
  flagMandatoryDueDate?: boolean;
  onInstallmentsChange?: (installments: unknown, totalAmount: string) => void;
};

let lastHookProps: HookProps | null = null;

const mockUseInstallmentManagementReturn = {
  fields: [] as Array<MockField>,
  validators: {
    amount: { required: 'Campo obbligatorio' },
    dueDate: { required: 'Campo obbligatorio' }
  },
  MIN_INSTALLMENTS: 2,
  MAX_INSTALLMENTS: 12,
  addInstallment: vi.fn(),
  removeInstallment: vi.fn()
};

vi.mock('../../../../hooks/useInstallmentManagement', () => ({
  useInstallmentManagement: vi.fn().mockImplementation((props) => {
    lastHookProps = props;
    return mockUseInstallmentManagementReturn;
  })
}));

vi.mock('./InstallmentItem', () => ({
  default: vi.fn(({ index, onRemove }) => (
    <div data-testid={`installment-item-${index}`}>
      <span>installment {index + 1}</span>
      {onRemove && (
        <button
          data-testid={`remove-installment-${index}`}
          onClick={() => onRemove(index)}
        >
          Remove
        </button>
      )}
    </div>
  ))
}));

vi.mock('@mui/material', () => {
  return {
    Box: ({
      children
    }: {
      children: ReactNode;
      component?: unknown;
      sx?: Record<string, unknown>;
    }) => <div data-testid="mui-box">{children}</div>,
    Paper: ({ children }: { children: ReactNode }) => (
      <div data-testid="mui-paper">{children}</div>
    ),
    Button: ({
      children,
      onClick,
      disabled,
      startIcon
    }: {
      children: ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      startIcon?: ReactNode;
      color?: string;
      sx?: Record<string, unknown>;
    }) => (
      <button data-testid="mui-button" onClick={onClick} disabled={disabled}>
        {startIcon && <span data-testid="button-icon">{startIcon}</span>}
        {children}
      </button>
    ),
    Typography: ({
      children
    }: {
      children: ReactNode;
      variant?: string;
      component?: string;
      color?: string;
      sx?: Record<string, unknown>;
      fontWeight?: string;
      mb?: number;
    }) => <div data-testid="mui-typography">{children}</div>,
    Grid: ({
      children
    }: {
      children: ReactNode;
      container?: boolean;
      item?: boolean;
      xs?: number;
      spacing?: number;
    }) => <div data-testid="mui-grid">{children}</div>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Divider: (_props: { sx?: Record<string, unknown> }) => (
      <hr data-testid="mui-divider" />
    )
  };
});

vi.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon">AddIcon</span>
}));

describe('InstallmentField', () => {
  const mockFields = [
    { id: 'field1', amount: '100', dueDate: null },
    { id: 'field2', amount: '200', dueDate: null }
  ];

  const mockControl = {} as Control<FieldValues>;
  const mockErrors = {};
  const mockSetValue = vi.fn();
  const mockGetValues = vi.fn();
  const mockTrigger = vi.fn();
  const mockOnInstallmentsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseInstallmentManagementReturn.fields = mockFields;
    mockUseInstallmentManagementReturn.addInstallment = vi.fn();
    mockUseInstallmentManagementReturn.removeInstallment = vi.fn();
    lastHookProps = null;
  });

  it('should render the component correctly', () => {
    render(
      <InstallmentField
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        fieldNamePrefix="installments"
      />
    );

    expect(
      screen.getByText('debtPositionCreateWizard.step3.installments.title')
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.installments.addInstallment'
      )
    ).toBeInTheDocument();

    const installmentItems = screen.getAllByTestId(/^installment-item-/);
    expect(installmentItems).toHaveLength(mockFields.length);
  });

  it('should call addInstallment when the button to add an installment is clicked', () => {
    render(
      <InstallmentField
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        fieldNamePrefix="installments"
      />
    );

    const addButton = screen.getByText(
      'debtPositionCreateWizard.step3.installments.addInstallment'
    );
    fireEvent.click(addButton);

    expect(
      mockUseInstallmentManagementReturn.addInstallment
    ).toHaveBeenCalledTimes(1);
  });

  it('should disable the button when the maximum number of installments is reached', () => {
    mockUseInstallmentManagementReturn.fields = Array(12)
      .fill({})
      .map((_, i) => ({ id: `field${i}`, amount: '100', dueDate: null }));

    render(
      <InstallmentField
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        fieldNamePrefix="installments"
      />
    );

    const addButton = screen.getByText(
      'debtPositionCreateWizard.step3.installments.addInstallment'
    );

    expect(addButton).toBeDisabled();
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.installments.maxInstallmentsReached'
      )
    ).toBeInTheDocument();
  });

  it('should pass flagMandatoryDueDate to useInstallmentManagement', () => {
    render(
      <InstallmentField
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        fieldNamePrefix="installments"
        flagMandatoryDueDate={false}
      />
    );

    expect(lastHookProps).toEqual(
      expect.objectContaining({
        flagMandatoryDueDate: false
      })
    );
  });

  it('should pass onInstallmentsChange to useInstallmentManagement', () => {
    render(
      <InstallmentField
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        fieldNamePrefix="installments"
        onInstallmentsChange={mockOnInstallmentsChange}
      />
    );

    expect(lastHookProps).toEqual(
      expect.objectContaining({
        onInstallmentsChange: expect.any(Function)
      })
    );
  });

  it('should disable all components when disabled is true', () => {
    render(
      <InstallmentField
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        fieldNamePrefix="installments"
        disabled={true}
      />
    );

    const addButton = screen.getByText(
      'debtPositionCreateWizard.step3.installments.addInstallment'
    );
    expect(addButton).toBeDisabled();
  });

  it('should pass the controller correctly to InstallmentItem', () => {
    render(
      <InstallmentField
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        fieldNamePrefix="installments"
      />
    );

    const installmentItems = screen.getAllByTestId(/^installment-item-/);
    expect(installmentItems).toHaveLength(mockFields.length);
  });

  it('should enable removeInstallment only for installments after the minimum required', () => {
    mockUseInstallmentManagementReturn.fields = Array(4)
      .fill({})
      .map((_, i) => ({ id: `field${i}`, amount: '100', dueDate: null }));

    render(
      <InstallmentField
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        fieldNamePrefix="installments"
      />
    );

    expect(
      screen.queryByTestId('remove-installment-0')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('remove-installment-1')
    ).not.toBeInTheDocument();

    expect(screen.queryByTestId('remove-installment-2')).toBeInTheDocument();
    expect(screen.queryByTestId('remove-installment-3')).toBeInTheDocument();
  });
});
