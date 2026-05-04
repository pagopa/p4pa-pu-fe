import { Control, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import { FormComponent } from '../../../../../components/FormComponent';
import { DebtTypeOrgForm, PaymentMethodOption } from '../../../types';

export type PaymentMethodProps = {
  control: Control<DebtTypeOrgForm>;
  name: Path<DebtTypeOrgForm>;
  selectedValue: PaymentMethodOption;
};

export const SelectedField = ({
  selectedValue,
  control
}: Omit<PaymentMethodProps, 'name'>) => {
  const { t } = useTranslation();

  switch (selectedValue) {
    case PaymentMethodOption.AMOUNT:
      return (
        <FormComponent.ControlledAmountField
          key="amountCents"
          name="amountCents"
          control={control}
          placeholder="0,00"
          label={t('debtTypeOrgCreate.behaviour.spontaneous.amountValue.label')}
        />
      );
    case PaymentMethodOption.EXTERNAL:
      return (
        <FormComponent.ControlledTextField
          key="externalPaymentUrl"
          name="externalPaymentUrl"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.spontaneous.externalUrl.label')}
          defaultValue="https://"
        />
      );

    default:
      return null; // No additional fields for FREE option
  }
};

export const PaymentMethodSelector = ({
  control,
  name,
  selectedValue
}: PaymentMethodProps) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <FormComponent.ControlledSelect
        name={name}
        control={control}
        label={t('debtTypeOrgCreate.behaviour.spontaneous.label')}
        required
        fullWidth
        disableClearable
        options={[
          {
            label: t('debtTypeOrgCreate.behaviour.spontaneous.free'),
            value: PaymentMethodOption.FREE
          },
          {
            label: t('debtTypeOrgCreate.behaviour.spontaneous.amount'),
            value: PaymentMethodOption.AMOUNT
          },
          {
            label: t('debtTypeOrgCreate.behaviour.spontaneous.external'),
            value: PaymentMethodOption.EXTERNAL
          }
        ]}
      />

      <SelectedField selectedValue={selectedValue} control={control} />
    </Stack>
  );
};
