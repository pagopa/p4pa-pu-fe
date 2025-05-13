import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import {
  PaymentMethodSelector,
  PaymentMethodOption
} from './PaymentMethodSelector';
import { Step2Data } from '..';

// Helper wrapper to test PaymentMethodSelector with react-hook-form
const renderWithForm = (
  defaultValue: PaymentMethodOption = PaymentMethodOption.FREE
) => {
  const Wrapper = () => {
    const { control, watch } = useForm<Step2Data>({
      defaultValues: {
        paymentMethod: defaultValue,
        fixedAmount: 0,
        customFieldsSchema: undefined,
        externalPaymentUrl: ''
      }
    });

    const paymentMethod = watch('paymentMethod');

    return (
      <form>
        <PaymentMethodSelector
          control={control}
          name="paymentMethod"
          selectedValue={paymentMethod}
        />
      </form>
    );
  };

  return render(<Wrapper />);
};

describe('PaymentMethodSelector', () => {
  it('renders the select with FREE as default option', () => {
    renderWithForm();

    const select = screen.getByRole('combobox', {
      name: 'debtTypeOrgCreate.behaviour.spontaneous.label'
    });
    expect(select).toBeInTheDocument();

    // Check options labels are rendered
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.spontaneous.free')
    ).toBeInTheDocument();
  });

  it('renders no additional field when FREE option is selected', () => {
    renderWithForm(PaymentMethodOption.FREE);

    // No additional inputs should be rendered
    expect(
      screen.queryByRole('textbox', { name: /amountValue/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: /externalUrl/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'debtTypeOrgCreate.behaviour.spontaneous.file.description'
      )
    ).not.toBeInTheDocument();
  });

  it('renders ControlledFileUploader when CUSTOM is selected', () => {
    renderWithForm(PaymentMethodOption.CUSTOM);

    // The description text should be present
    expect(
      screen.getByText(
        'debtTypeOrgCreate.behaviour.spontaneous.file.description'
      )
    ).toBeInTheDocument();
  });

  it('changes selected option and updates rendered field accordingly', () => {
    const Wrapper = () => {
      const { control, watch, setValue } = useForm<Step2Data>({
        defaultValues: {
          paymentMethod: PaymentMethodOption.FREE,
          fixedAmount: 0,
          customFieldsSchema: undefined,
          externalPaymentUrl: ''
        }
      });

      const paymentMethod = watch('paymentMethod');

      return (
        <>
          <PaymentMethodSelector
            control={control}
            name="paymentMethod"
            selectedValue={paymentMethod}
          />
          <button
            onClick={() =>
              setValue('paymentMethod', PaymentMethodOption.AMOUNT)
            }
            data-testid="set-amount"
          >
            Set Amount
          </button>
          <button
            onClick={() =>
              setValue('paymentMethod', PaymentMethodOption.CUSTOM)
            }
            data-testid="set-custom"
          >
            Set Custom
          </button>
          <button
            onClick={() =>
              setValue('paymentMethod', PaymentMethodOption.EXTERNAL)
            }
            data-testid="set-external"
          >
            Set External
          </button>
          <button
            onClick={() => setValue('paymentMethod', PaymentMethodOption.FREE)}
            data-testid="set-free"
          >
            Set Free
          </button>
        </>
      );
    };

    render(<Wrapper />);

    // Initially FREE: no additional fields
    expect(
      screen.queryByRole('textbox', { name: /amountValue/i })
    ).not.toBeInTheDocument();

    // Change to AMOUNT
    fireEvent.click(screen.getByTestId('set-amount'));
    expect(
      screen.getByRole('textbox', {
        name: 'debtTypeOrgCreate.behaviour.spontaneous.amountValue.label'
      })
    ).toBeInTheDocument();

    // Change to CUSTOM
    fireEvent.click(screen.getByTestId('set-custom'));
    expect(
      screen.getByText(
        'debtTypeOrgCreate.behaviour.spontaneous.file.description'
      )
    ).toBeInTheDocument();

    // Change to EXTERNAL
    fireEvent.click(screen.getByTestId('set-external'));
    expect(
      screen.getByRole('textbox', {
        name: 'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.label'
      })
    ).toBeInTheDocument();

    // Change back to FREE
    fireEvent.click(screen.getByTestId('set-free'));
    expect(
      screen.queryByRole('textbox', { name: /amountValue/i })
    ).not.toBeInTheDocument();
  });
});
