import { Control, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import { FormComponent } from '../../../../../components/FormComponent';
import { Step2Data } from '..';
import Typography from '@mui/material/Typography';
import EuroIcon from '@mui/icons-material/Euro';

export enum PaymentMethodOption {
  FREE = 'free',
  AMOUNT = 'amount',
  CUSTOM = 'custom',
  EXTERNAL = 'external'
}

export type PaymentMethodProps = {
  control: Control<Step2Data>;
  name: Path<Step2Data>;
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
          name="amountCents"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.spontaneous.amountValue.label')}
          InputProps={{
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
          fileExtensionsAllowed={['xsd']}
          header={
            <Typography fontWeight="bold">
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
