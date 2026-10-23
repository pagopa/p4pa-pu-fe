import type { Control } from 'react-hook-form';
import { FormComponent } from '../../../components/FormComponent';
import type { OrgSilServiceFormData } from '../schema';
import { AUTH_CONFIG_OPTIONS } from '../utils/orgSilServiceFormUtils';
import { BasicAuthFields } from './BasicAuthFields';
import { JwtAuthFields } from './JwtAuthFields';
import Stack from '@mui/material/Stack';

type LegacyAuthConfigurationProps = {
  control: Control<OrgSilServiceFormData>;
  authConfigType: string | undefined;
  t: (key: string) => string;
};

export const LegacyAuthConfiguration = ({
  control,
  authConfigType,
  t
}: LegacyAuthConfigurationProps) => (
  <Stack spacing={3}>
    <FormComponent.ControlledSelect
      name="authConfigType"
      control={control}
      label={t('orgSilServiceCreate.authConfig')}
      required
      options={AUTH_CONFIG_OPTIONS.map((option) => ({
        ...option,
        label: t(option.label)
      }))}
    />

    {authConfigType === 'basic' && <BasicAuthFields control={control} t={t} />}

    {authConfigType === 'jwt' && <JwtAuthFields control={control} t={t} />}
  </Stack>
);
