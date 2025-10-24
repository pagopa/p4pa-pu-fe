/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { PaymentMethodSelector, SelectedField } from './PaymentMethodSelector';
import { DebtTypeOrgForm, PaymentMethodOption } from '../../../types';

vi.mock('../../../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledSelect: ({ label, options }: any) => (
      <div data-testid="controlled-select">
        <label>{label}</label>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </div>
    ),
    ControlledTextField: ({ label, name, placeholder, defaultValue }: any) => (
      <input
        data-testid={`text-field-${name}`}
        aria-label={label}
        placeholder={placeholder}
        value={defaultValue}
        readOnly
      />
    ),
    ControlledAmountField: ({
      label,
      name,
      placeholder,
      defaultValue
    }: any) => (
      <input
        data-testid={`text-field-${name}`}
        aria-label={label}
        placeholder={placeholder}
        value={defaultValue}
        readOnly
      />
    ),
    ControlledFileUploader: ({ description, header }: any) => (
      <div data-testid="file-uploader">
        <div>{header}</div>
        <div>{description}</div>
      </div>
    )
  }
}));

const renderWithForm = (defaultValue: PaymentMethodOption) => {
  const Wrapper = () => {
    const { control, watch } = useForm<DebtTypeOrgForm>({
      defaultValues: {
        paymentMethod: defaultValue,
        amountCents: 0,
        xsdDefinitionRef: undefined,
        externalPaymentUrl: ''
      }
    });

    const paymentMethod = watch('paymentMethod');

    return (
      <PaymentMethodSelector
        control={control}
        name="paymentMethod"
        selectedValue={paymentMethod}
      />
    );
  };

  return render(<Wrapper />);
};

describe('PaymentMethodSelector', () => {
  it('renders the select with all payment method options', () => {
    renderWithForm(PaymentMethodOption.FREE);

    expect(screen.getByTestId('controlled-select')).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.spontaneous.label')
    ).toBeInTheDocument();

    // Check all options are present
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.spontaneous.free')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.spontaneous.amount')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.spontaneous.custom')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.spontaneous.external')
    ).toBeInTheDocument();
  });

  it('renders no additional field when FREE option is selected', () => {
    renderWithForm(PaymentMethodOption.FREE);

    expect(
      screen.queryByTestId('text-field-amountCents')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('text-field-externalPaymentUrl')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('file-uploader')).not.toBeInTheDocument();
  });

  it('renders amount text field when AMOUNT option is selected', () => {
    renderWithForm(PaymentMethodOption.AMOUNT);

    const amountField = screen.getByTestId('text-field-amountCents');
    expect(amountField).toBeInTheDocument();
    expect(amountField).toHaveAttribute(
      'aria-label',
      'debtTypeOrgCreate.behaviour.spontaneous.amountValue.label'
    );
    expect(amountField).toHaveAttribute('placeholder', '0,00');
  });

  it('renders file uploader when CUSTOM option is selected', () => {
    renderWithForm(PaymentMethodOption.CUSTOM);

    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
    expect(
      screen.getByText(
        'debtTypeOrgCreate.behaviour.spontaneous.file.description'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.spontaneous.file.header')
    ).toBeInTheDocument();
  });

  it('renders external URL text field when EXTERNAL option is selected', () => {
    renderWithForm(PaymentMethodOption.EXTERNAL);

    const urlField = screen.getByTestId('text-field-externalPaymentUrl');
    expect(urlField).toBeInTheDocument();
    expect(urlField).toHaveAttribute(
      'aria-label',
      'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.label'
    );
    expect(urlField).toHaveValue('https://');
  });
});

describe('SelectedField', () => {
  const mockControl = {} as any;

  it('returns null for FREE payment method', () => {
    const { container } = render(
      <SelectedField
        selectedValue={PaymentMethodOption.FREE}
        control={mockControl}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders amount field for AMOUNT payment method', () => {
    render(
      <SelectedField
        selectedValue={PaymentMethodOption.AMOUNT}
        control={mockControl}
      />
    );

    expect(screen.getByTestId('text-field-amountCents')).toBeInTheDocument();
  });

  it('renders file uploader for CUSTOM payment method', () => {
    render(
      <SelectedField
        selectedValue={PaymentMethodOption.CUSTOM}
        control={mockControl}
      />
    );

    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
  });

  it('renders external URL field for EXTERNAL payment method', () => {
    render(
      <SelectedField
        selectedValue={PaymentMethodOption.EXTERNAL}
        control={mockControl}
      />
    );

    expect(
      screen.getByTestId('text-field-externalPaymentUrl')
    ).toBeInTheDocument();
  });
});
