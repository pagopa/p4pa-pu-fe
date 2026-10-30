import type { Control } from 'react-hook-form';
import { FormComponent } from '../../../components/FormComponent';
import type { OrgSilServiceFormData } from '../schema';
import { JWT_ALGORITHM_OPTIONS } from '../utils/orgSilServiceFormUtils';
import Stack from '@mui/material/Stack';

type JwtAuthFieldsProps = {
  control: Control<OrgSilServiceFormData>;
  t: (key: string) => string;
};

export const JwtAuthFields = ({ control, t }: JwtAuthFieldsProps) => (
  <Stack spacing={3}>
    <FormComponent.ControlledTextField
      name="jwtKid"
      control={control}
      label={t('orgSilServiceCreate.jwtKid')}
      required
      noAdornment
    />
    <FormComponent.ControlledTextField
      name="jwtIssuer"
      control={control}
      label={t('orgSilServiceCreate.jwtIssuer')}
      required
      noAdornment
    />
    <FormComponent.ControlledTextField
      name="jwtSubject"
      control={control}
      label={t('orgSilServiceCreate.jwtSubject')}
      required
      noAdornment
    />
    <FormComponent.ControlledSelect
      name="jwtAlgorithm"
      control={control}
      label={t('orgSilServiceCreate.jwtAlgorithm')}
      required
      options={JWT_ALGORITHM_OPTIONS}
    />
    <FormComponent.ControlledTextField
      name="jwtSigningKey"
      control={control}
      label={t('orgSilServiceCreate.jwtSigningKey')}
      required
      noAdornment
    />
  </Stack>
);
