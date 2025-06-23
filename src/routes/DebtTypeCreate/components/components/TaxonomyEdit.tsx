import Stack from '@mui/material/Stack';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormComponent } from '../../../../components/FormComponent';
import { DebtPositionTypeDetailDTO } from '../../../../../generated/data-contracts';

type TaxonomyEditProps = {
  prefilledData?: Partial<DebtPositionTypeDetailDTO>;
};

export const TaxonomyEdit = ({ prefilledData }: TaxonomyEditProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <Stack gap={2} data-testid="taxonomy-edit">
      <FormComponent.ControlledTextField
        name="orgType"
        required={false}
        control={control}
        label={t('taxonomy.orgType.label')}
        defaultValue={prefilledData?.orgType}
        disabled
      />

      <FormComponent.ControlledTextField
        name="macroAreaCode"
        required={false}
        control={control}
        label={t('taxonomy.macroArea.label')}
        defaultValue={prefilledData?.macroArea}
        disabled
      />
      <Stack direction="row" gap={2}>
        <FormComponent.ControlledTextField
          name="serviceTypeCode"
          required={false}
          control={control}
          label={t('taxonomy.serviceType.label')}
          defaultValue={prefilledData?.serviceType}
          disabled
        />
        <FormComponent.ControlledTextField
          name="collectingReason"
          required={false}
          control={control}
          label={t('taxonomy.collectingReason.label')}
          defaultValue={prefilledData?.collectingReason}
          disabled
        />
      </Stack>
      <FormComponent.ControlledTextField
        name="taxonomyCode"
        required={false}
        control={control}
        label={t('taxonomy.taxonomyCode.label')}
        defaultValue={prefilledData?.taxonomyCode}
        disabled
      />
    </Stack>
  );
};
