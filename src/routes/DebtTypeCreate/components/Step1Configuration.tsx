import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import LocalOffer from '@mui/icons-material/LocalOffer';
import BookIcon from '@mui/icons-material/MenuBook';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import Typography from '@mui/material/Typography';
import { TFunction } from 'i18next';

export type Step1Data = {
  debtPositionType: string;
  taxonomy: string;
};

export type Step1Props = {
  setData: (data: Step1Data) => void;
  onNext: () => void;
};

const validationSchema = (t: TFunction) =>
  yup.object({
    debtPositionType: yup
      .string()
      .required(t('debtTypeCreate.configuration.debtType.required'))
      .max(100, t('debtTypeCreate.configuration.debtType.maxCharacters')),
    taxonomy: yup
      .string()
      .required(t('debtTypeCreate.configuration.taxonomy.required'))
  });

export const Step1Configuration = ({ setData, onNext }: Step1Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched'
  });

  const onSubmit = (values: Step1Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form">
      <WizardStepWrapper
        title={t('debtTypeCreate.configuration.title')}
        subtitle={t('debtTypeCreate.configuration.subtitle')}
        alertMessage={t('debtTypeCreate.configuration.alertMessage')}
      >
        <SectionBox
          title={t('debtTypeCreate.configuration.debtType.title')}
          adornment={<BookIcon />}
        >
          <Controller
            name="debtPositionType"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormComponent.TextField
                {...field}
                ref={null}
                required
                label={t('debtTypeCreate.configuration.debtType.label')}
                id="debtPositionType"
                placeholder={t(
                  'debtTypeCreate.configuration.debtType.placeholder'
                )}
                error={!!errors.debtPositionType}
                helperText={errors.debtPositionType?.message}
                adornment={`${field.value?.length}/100`}
              />
            )}
          />
          <Typography variant="caption" px={1.5}>
            {t('debtTypeCreate.configuration.debtType.helper')}
          </Typography>
        </SectionBox>

        <SectionBox
          title={t('debtTypeCreate.configuration.taxonomy.title')}
          adornment={<LocalOffer />}
        >
          <Controller
            control={control}
            name="taxonomy"
            defaultValue=""
            render={({ field }) => (
              <FormComponent.Select
                {...field}
                ref={null}
                required
                label={t('debtTypeCreate.configuration.taxonomy.label')}
                id="taxonomy"
                options={[
                  { value: 'option0', label: t('form.option0') },
                  { value: 'option1', label: t('form.option1') },
                  { value: 'option2', label: t('form.option2') }
                ]}
                error={!!errors.taxonomy}
                helperText={errors.taxonomy?.message}
              />
            )}
          />
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons disableBack onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
