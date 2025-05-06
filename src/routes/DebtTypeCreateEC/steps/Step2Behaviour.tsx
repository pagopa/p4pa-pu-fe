import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Stack from '@mui/material/Stack';
import { z } from 'zod';

import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import { TFunction } from 'i18next';

export type Step2Data = {
  enableFeature: boolean;

  // now explicit booleans instead of an array
  optionA: boolean;
  optionB: boolean;

  radioChoice: string;

  notes?: string;
  amount?: string;
  detailA?: string;
  detailB?: string;
};

export type Step2Props = {
  setData: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    enableFeature: z.boolean(),

    optionA: z.boolean(),
    optionB: z.boolean(),

    radioChoice: z.string({
      required_error: t('step2.radioChoice.required')
    }),

    notes: z.string().optional(),
    amount: z.string().optional(),
    detailA: z.string().optional(),
    detailB: z.string().optional()
  });

export const Step2Behaviour = ({ setData, onNext, onBack }: Step2Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);

  const form = useForm<Step2Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      enableFeature: false,
      optionA: false,
      optionB: false,
      radioChoice: '',
      notes: '',
      amount: '',
      detailA: '',
      detailB: ''
    }
  });

  const { control, handleSubmit } = form;

  const onSubmit = (values: Step2Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form" onSubmit={handleSubmit(onSubmit)}>
      <WizardStepWrapper
        title={t('step2.title')}
        subtitle={t('step2.subtitle')}
        alertMessage={t('step2.alertMessage')}
      >
        <FormComponent.ControlledSwitch
          control={control}
          name="enableFeature"
          label={t('step2.enableFeature.label')}
        />

        <SectionBox title={t('step2.options.title')} adornment={<TuneIcon />}>
          <FormComponent.ControlledCheckbox
            control={control}
            name="optionA"
            label={t('step2.options.optionA.label')}
            description={t('step2.options.optionA.description')}
          />
          <FormComponent.ControlledCheckbox
            control={control}
            name="optionB"
            label={t('step2.options.optionB.label')}
            description={t('step2.options.optionB.description')}
          />
        </SectionBox>

        <SectionBox
          title={t('step2.radioChoice.title')}
          adornment={<NotificationsIcon />}
        >
          <FormComponent.ControlledRadioGroup
            name="radioChoice"
            control={control}
            label={t('step2.radioChoice.label')}
            options={[
              { value: 'choice1', label: t('step2.radioChoice.choice1') },
              { value: 'choice2', label: t('step2.radioChoice.choice2') }
            ]}
          />
        </SectionBox>

        <SectionBox
          title={t('step2.additionalInfo.title')}
          subtitle={t('step2.additionalInfo.subtitle')}
          adornment={<MonetizationOnIcon />}
        >
          <Stack direction="row" spacing={2}>
            <FormComponent.ControlledTextField
              name="notes"
              control={control}
              label={t('step2.additionalInfo.notes')}
            />
            <FormComponent.ControlledTextField
              name="amount"
              control={control}
              label={t('step2.additionalInfo.amount')}
            />
          </Stack>
          <Stack direction="row" spacing={2} mt={2}>
            <FormComponent.ControlledTextField
              name="detailA"
              control={control}
              label={t('step2.additionalInfo.detailA')}
            />
            <FormComponent.ControlledTextField
              name="detailB"
              control={control}
              label={t('step2.additionalInfo.detailB')}
            />
          </Stack>
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
