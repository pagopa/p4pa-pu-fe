import Stack from '@mui/material/Stack';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormComponent } from '../../../../components/FormComponent';
import { Step1Data } from '../Step1Configuration';

type TaxonomyEditProps = {
  prefilledData?: Partial<Step1Data>;
};

export const TaxonomyEdit = ({ prefilledData }: TaxonomyEditProps) => {
  const { t } = useTranslation();
  const { control, watch } = useFormContext();

  const orgType = watch('orgType');

  return (
    <>
      <FormComponent.ControlledTextField
        name="orgType"
        control={control}
        label={t('debtTypeCreate.configuration.orgType')}
        defaultValue={prefilledData?.orgType}
        disabled
      />

      {orgType && (
        <Stack direction="row" gap={2} mt={2}>
          <FormComponent.ControlledTextField
            name="macroArea"
            control={control}
            label={t('debtTypeCreate.configuration.macroArea')}
            defaultValue={prefilledData?.macroAreaCode}
            disabled
          />
          <FormComponent.ControlledTextField
            name="serviceType"
            control={control}
            label={t('debtTypeCreate.configuration.serviceType')}
            defaultValue={prefilledData?.serviceTypeCode}
            disabled
          />
          <FormComponent.ControlledTextField
            name="collectingReason"
            control={control}
            label={t('debtTypeCreate.configuration.collectingReason')}
            defaultValue={prefilledData?.collectingReason}
            disabled
          />
          <FormComponent.ControlledTextField
            name="taxonomyCode"
            control={control}
            label={t('debtTypeCreate.configuration.taxonomyCode')}
            defaultValue={prefilledData?.taxonomyCode}
            disabled
          />
        </Stack>
      )}
    </>
  );
};
