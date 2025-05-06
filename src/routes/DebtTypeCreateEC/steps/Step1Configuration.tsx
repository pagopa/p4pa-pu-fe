import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BookIcon from '@mui/icons-material/MenuBook';
import PaymentIcon from '@mui/icons-material/Payment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TFunction } from 'i18next';
import { z } from 'zod';

import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import { useStore } from '../../../store/GlobalStore';
import { useDebtPositionsTypeOrg } from '../../../hooks/useDebtPositionsTypeOrg';

export type Step1Data = {
  debtType: number;
  description?: string;
  code?: string;
  selection: string;
};

export type Step1Props = {
  setData: (data: Step1Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    debtType: z.number({
      required_error: t('debtTypeCreateEC.configuration.debtType.required')
    }),
    code: z.string().optional(),
    description: z
      .string()
      .max(100, t('debtTypeCreateEC.configuration.description.maxCharacters'))
      .optional(),
    selection: z.string()
  });

export const Step1Configuration = ({ setData, onNext, onBack }: Step1Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);

  const form = useForm<Step1Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });

  const {
    state: { organizationId }
  } = useStore();
  const debtPositionsTypes = useDebtPositionsTypeOrg({ organizationId });

  const { control, handleSubmit, watch } = form;

  const onSubmit = async (values: Step1Data) => {
    setData(values);
    onNext();
  };

  const description = watch('description');

  return (
    <form aria-label="form">
      <WizardStepWrapper
        title={t('debtTypeCreateEC.configuration.title')}
        subtitle={t('debtTypeCreateEC.configuration.subtitle')}
        alertMessage={t('debtTypeCreateEC.configuration.alertMessage')}
      >
        <SectionBox
          title={t('debtTypeCreateEC.configuration.debtType.title')}
          adornment={<BookIcon />}
        >
          <FormComponent.ControlledSelect
            control={control}
            label={t('debtTypeCreateEC.configuration.debtType.label')}
            name="debtType"
            options={debtPositionsTypes.optionsMap}
          />
        </SectionBox>

        <SectionBox
          title={t('debtTypeCreateEC.configuration.debtTypeVersion.title')}
          subtitle={t(
            'debtTypeCreateEC.configuration.debtTypeVersion.subtitle'
          )}
          adornment={<PostAddIcon />}
        >
          <Stack direction="row" spacing={3}>
            <FormComponent.ControlledTextField
              name="code"
              sx={{ flex: 1 }}
              control={control}
              label={t('debtTypeCreateEC.configuration.code.label')}
              noAdornment
              required={false}
            />
            <Stack flex={3}>
              <FormComponent.ControlledTextField
                name="description"
                control={control}
                label={t('debtTypeCreateEC.configuration.description.label')}
                adornment={`${description?.length || 0}/100`}
                required={false}
              />
              <Typography variant="caption" px={1.5}>
                {t('debtTypeCreateEC.configuration.description.caption')}
              </Typography>
            </Stack>
          </Stack>
        </SectionBox>
        <SectionBox
          title={t('debtTypeCreateEC.configuration.selection.title')}
          adornment={<PaymentIcon />}
        >
          <FormComponent.ControlledRadioGroup
            name="selection"
            control={control}
            label={t('debtTypeCreateEC.configuration.selection.label')}
            options={[
              {
                value: 'option1',
                label: t('debtTypeCreateEC.configuration.selection.option1')
              },
              {
                value: 'option2',
                label: t('debtTypeCreateEC.configuration.selection.option2')
              }
            ]}
          />
        </SectionBox>
      </WizardStepWrapper>

      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
