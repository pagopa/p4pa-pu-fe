import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';

export type Step2Props = {
  editmode?: boolean;
};

export const Step2Payments = ({ editmode = false }: Step2Props) => {
  const { t } = useTranslation();

  const { control } = useFormContext();

  return (
    <WizardStepWrapper>
      <Stack direction="column" gap={2} alignItems="left" width="100%">
        <FormComponent.ControlledRadioGroup
          name="addPaymentsToAssessment"
          data-testid="addPaymentsToAssessment"
          defaultValue={false}
          control={control}
          label={t(
            'assessmentCreate.configuration.step2.addPayments.radioLabel'
          )}
          sx={{ flexDirection: 'row' }}
          disabled={editmode}
          options={[
            {
              value: true,
              label: t(
                'assessmentCreate.configuration.step2.addPayments.options.yes'
              )
            },
            {
              value: false,
              label: t(
                'assessmentCreate.configuration.step2.addPayments.options.no'
              )
            }
          ]}
        />
      </Stack>
    </WizardStepWrapper>
  );
};
