import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import { DebtTypeOrgForm } from '@core/routes/DebtTypeOrgCreate/types';
import { FormComponent } from '@core/components/FormComponent';

type CostConfigurationProps = {
  index: number;
  disabled?: boolean;
};

export const CostConfiguration = ({
  index,
  disabled
}: CostConfigurationProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext<DebtTypeOrgForm>();

  const prefix = `debtPositionTypeOrgBalanceCostRequestList.${index}` as const;

  return (
    <Stack gap={2}>
      <Stack direction="row" gap={2}>
        <FormComponent.ControlledTextField
          disabled={disabled}
          name={`${prefix}.sectionCode`}
          control={control}
          label={t('debtTypeOrgCreate.accounting.sectionCode')}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <FormComponent.ControlledTextField
          disabled={disabled}
          name={`${prefix}.sectionDescription`}
          control={control}
          label={t('debtTypeOrgCreate.accounting.sectionDescription')}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <Stack direction="row" gap={2}>
        <FormComponent.ControlledTextField
          disabled={disabled}
          name={`${prefix}.officeCode`}
          control={control}
          label={t('debtTypeOrgCreate.accounting.officeCode')}
          required={false}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <FormComponent.ControlledTextField
          disabled={disabled}
          name={`${prefix}.officeDescription`}
          control={control}
          label={t('debtTypeOrgCreate.accounting.officeDescription')}
          required={false}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <Stack direction="row" gap={2}>
        <FormComponent.ControlledTextField
          disabled={disabled}
          name={`${prefix}.assessmentCode`}
          control={control}
          label={t('debtTypeOrgCreate.accounting.assessmentCode')}
          required={false}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <FormComponent.ControlledTextField
          disabled={disabled}
          name={`${prefix}.assessmentDescription`}
          control={control}
          label={t('debtTypeOrgCreate.accounting.assessmentDescription')}
          required={false}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
    </Stack>
  );
};
