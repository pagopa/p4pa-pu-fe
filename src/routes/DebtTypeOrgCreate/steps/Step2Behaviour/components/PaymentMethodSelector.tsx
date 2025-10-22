import { Control, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import { FormComponent } from '../../../../../components/FormComponent';
import Typography from '@mui/material/Typography';
import EuroIcon from '@mui/icons-material/Euro';
import { DebtTypeOrgForm } from '../../../types';

export enum PaymentMethodOption {
  FREE = 'free',
  AMOUNT = 'amount',
  CUSTOM = 'custom',
  EXTERNAL = 'external'
}

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
        <FormComponent.ControlledTextField
          key="amountCents"
          name="amountCents"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.spontaneous.amountValue.label')}
          placeholder="0,00"
          inputProps={{
            type: 'number',
            inputMode: 'decimal',
            pattern: '[0-9]*[,.]?[0-9]*',
            endAdornment: (
              <InputAdornment position="end">
                <EuroIcon />
              </InputAdornment>
            )
          }}
        />
      );

    case PaymentMethodOption.CUSTOM:
      return (
        <FormComponent.ControlledFileUploader
          name="xsdDefinitionRef"
          control={control}
          description={t(
            'debtTypeOrgCreate.behaviour.spontaneous.file.description'
          )}
          fileExtensionsAllowed={['xsd', 'xml']}
          header={
            <Typography fontWeight="bold" color="textPrimary">
              {t('debtTypeOrgCreate.behaviour.spontaneous.file.header')}
              <Typography component="span" color="error">
                *
              </Typography>
            </Typography>
          }
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
            label: t('debtTypeOrgCreate.behaviour.spontaneous.custom'),
            value: PaymentMethodOption.CUSTOM
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
