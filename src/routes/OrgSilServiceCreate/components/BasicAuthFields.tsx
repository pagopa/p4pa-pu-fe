import { Stack } from '@mui/material';
import { Control } from 'react-hook-form';
import { FormComponent } from '../../../components/FormComponent';
import { OrgSilServiceFormData } from '../schema';

type BasicAuthFieldsProps = {
  control: Control<OrgSilServiceFormData>;
  t: (key: string) => string;
};

export const BasicAuthFields = ({ control, t }: BasicAuthFieldsProps) => (
  <Stack spacing={3}>
    <FormComponent.ControlledTextField
      name="basicUser"
      control={control}
      label={t('orgSilServiceCreate.basicUser')}
      required
      noAdornment
    />
    <FormComponent.ControlledTextField
      name="basicPassword"
      control={control}
      label={t('orgSilServiceCreate.basicPassword')}
      required
      noAdornment
    />
    <FormComponent.ControlledTextField
      name="basicAuthURL"
      control={control}
      label={t('orgSilServiceCreate.basicAuthURL')}
      required
      noAdornment
    />
  </Stack>
);
