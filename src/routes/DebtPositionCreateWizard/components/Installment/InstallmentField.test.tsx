import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import InstallmentField from './InstallmentField';
import { useInstallmentManagement } from '../../../../hooks/useInstallmentManagement';
import { Control, FieldValues } from 'react-hook-form';
import { ReactNode } from 'react';

// Mock dei moduli esterni
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../../hooks/useInstallmentManagement', () => ({
  useInstallmentManagement: vi.fn()
}));

// Mock di InstallmentItem
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

// Mock per Material UI
vi.mock('@mui/material', () => {
  return {
    Box: ({
      children,
      component,
      sx
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
      startIcon,
      color,
      sx
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
      children,
      variant,
      component,
      color,
      sx
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
      children,
      container,
      item,
      xs,
      spacing
    }: {
      children: ReactNode;
      container?: boolean;
      item?: boolean;
      xs?: number;
      spacing?: number;
    }) => <div data-testid="mui-grid">{children}</div>
  };
});

// Mock per Material UI icons
vi.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon">AddIcon</span>
}));

describe('InstallmentField', () => {
  // Mock dei dati e funzioni necessarie per i test
  const mockFields = [
    { id: 'field1', amount: '100', dueDate: null },
    { id: 'field2', amount: '200', dueDate: null }
  ];

  const mockValidators = {
    amount: { required: 'Campo obbligatorio' },
    dueDate: { required: 'Campo obbligatorio' }
  };

  const mockAddInstallment = vi.fn();
  const mockRemoveInstallment = vi.fn();
  const mockControl = {} as Control<FieldValues>;
  const mockErrors = {};
  const mockSetValue = vi.fn();
  const mockGetValues = vi.fn();
  const mockTrigger = vi.fn();
  const mockOnInstallmentsChange = vi.fn();

  // Setup del mock per useInstallmentManagement
  beforeEach(() => {
    vi.clearAllMocks();
    (
      useInstallmentManagement as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      fields: mockFields,
      validators: mockValidators,
      MIN_INSTALLMENTS: 2,
      MAX_INSTALLMENTS: 12,
      addInstallment: mockAddInstallment,
      removeInstallment: mockRemoveInstallment
    });
  });

  it('renderizza il componente correttamente', () => {
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

    // Verifica la presenza del titolo
    expect(
      screen.getByText('debtPositionCreateWizard.step3.installments.title')
    ).toBeInTheDocument();

    // Verifica che il pulsante per aggiungere rate sia presente
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.installments.addInstallment'
      )
    ).toBeInTheDocument();

    // Verifica che vengano renderizzati i componenti InstallmentItem
    // Usiamo getAllByTestId invece di getAllByText per evitare di contare testo duplicato
    const installmentItems = screen.getAllByTestId(/^installment-item-/);
    expect(installmentItems).toHaveLength(mockFields.length);
  });

  it('chiama addInstallment quando si clicca sul pulsante per aggiungere una rata', () => {
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

    expect(mockAddInstallment).toHaveBeenCalledTimes(1);
  });

  it('disabilita il pulsante quando si raggiunge il numero massimo di rate', () => {
    // Modifica il mock per simulare il raggiungimento del numero massimo di rate
    (
      useInstallmentManagement as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      fields: Array(12)
        .fill({})
        .map((_, i) => ({ id: `field${i}`, amount: '100', dueDate: null })),
      validators: mockValidators,
      MIN_INSTALLMENTS: 2,
      MAX_INSTALLMENTS: 12,
      addInstallment: mockAddInstallment,
      removeInstallment: mockRemoveInstallment
    });

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

  it('passa flagMandatoryDueDate a useInstallmentManagement', () => {
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

    expect(useInstallmentManagement).toHaveBeenCalledWith(
      expect.objectContaining({
        flagMandatoryDueDate: false
      })
    );
  });

  it('passa onInstallmentsChange al hook useInstallmentManagement', () => {
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

    expect(useInstallmentManagement).toHaveBeenCalledWith(
      expect.objectContaining({
        onInstallmentsChange: expect.any(Function)
      })
    );
  });

  it('disabilita tutti i componenti quando disabled è true', () => {
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

  it('passa il controller correttamente a InstallmentItem', () => {
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

    // Verifica che InstallmentItem sia stato renderizzato correttamente con i campi previsti
    // Utilizziamo il testid specifico per contare i componenti InstallmentItem
    const installmentItems = screen.getAllByTestId(/^installment-item-/);
    expect(installmentItems).toHaveLength(mockFields.length);
  });

  it('abilita removeInstallment solo per rate oltre il minimo richiesto', () => {
    // Modifica il mock per simulare 4 rate
    (
      useInstallmentManagement as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      fields: Array(4)
        .fill({})
        .map((_, i) => ({ id: `field${i}`, amount: '100', dueDate: null })),
      validators: mockValidators,
      MIN_INSTALLMENTS: 2,
      MAX_INSTALLMENTS: 12,
      addInstallment: mockAddInstallment,
      removeInstallment: mockRemoveInstallment
    });

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

    // Le prime due rate non dovrebbero avere il pulsante di rimozione (sono sotto MIN_INSTALLMENTS)
    expect(
      screen.queryByTestId('remove-installment-0')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('remove-installment-1')
    ).not.toBeInTheDocument();

    // Le rate dopo MIN_INSTALLMENTS dovrebbero avere il pulsante di rimozione
    expect(screen.queryByTestId('remove-installment-2')).toBeInTheDocument();
    expect(screen.queryByTestId('remove-installment-3')).toBeInTheDocument();
  });
});
