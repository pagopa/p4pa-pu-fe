import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import LocalOffer from '@mui/icons-material/LocalOffer';
import BookIcon from '@mui/icons-material/MenuBook';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import Typography from '@mui/material/Typography';
import { TFunction } from 'i18next';
import { z } from 'zod';
import { useTaxonomyForm } from '../../../hooks/useTaxonomyForm';

export type Step1Data = {
  debtPositionType: string;
};

export type Step1Props = {
  setData: (data: Step1Data) => void;
  onNext: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    debtPositionType: z
      .string()
      .max(100, t('debtTypeCreate.configuration.debtType.maxCharacters'))
      .nonempty(t('debtTypeCreate.configuration.debtType.required'))
  });

export const Step1Configuration = ({ setData, onNext }: Step1Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);
  const { renderTaxonomySelects } = useTaxonomyForm();

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
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
          {renderTaxonomySelects()}
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons disableBack onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
