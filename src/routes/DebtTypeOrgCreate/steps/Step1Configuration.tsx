import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TFunction } from 'i18next';
import { z } from 'zod';

import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import { useStore } from '../../../store/GlobalStore';
import { useDebtPositionTypesByOrg } from '../../../hooks/useDebtPositionTypesByOrg';

export type Step1Data = {
  debtPositionTypeId: number;
  description: string;
  code: string;
};

export type Step1Props = {
  setData: (data: Step1Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    debtPositionTypeId: z.number({
      required_error: t('debtTypeOrgCreate.configuration.debtType.required')
    }),
    code: z.string({
      required_error: t('debtTypeOrgCreate.configuration.code.required')
    }),
    description: z
      .string({
        required_error: t(
          'debtTypeOrgCreate.configuration.description.required'
        )
      })
      .max(100, t('debtTypeOrgCreate.configuration.description.maxCharacters'))
  });

export const Step1Configuration = ({ setData, onNext, onBack }: Step1Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);

  const {
    state: { organizationId }
  } = useStore();
  const { optionsMap } = useDebtPositionTypesByOrg({
    organizationId
  });

  const { control, handleSubmit, watch } = useForm<Step1Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });

  const onSubmit = async (values: Step1Data) => {
    setData(values);
    onNext();
  };

  const description = watch('description');

  return (
    <form aria-label="form">
      <WizardStepWrapper
        title={t('debtTypeOrgCreate.configuration.title')}
        subtitle={t('debtTypeOrgCreate.configuration.subtitle')}
        alertMessage={t('debtTypeOrgCreate.configuration.alertMessage')}
      >
        <SectionBox
          title={t('debtTypeOrgCreate.configuration.debtType.title')}
          adornment={<BookIcon />}
        >
          <FormComponent.ControlledSelect
            control={control}
            label={t('debtTypeOrgCreate.configuration.debtType.label')}
            name="debtPositionTypeId"
            disabled={!optionsMap?.length}
            options={optionsMap}
          />
        </SectionBox>

        <SectionBox
          title={t('debtTypeOrgCreate.configuration.debtTypeVersion.title')}
          subtitle={t(
            'debtTypeOrgCreate.configuration.debtTypeVersion.subtitle'
          )}
          adornment={<PostAddIcon />}
        >
          <Stack direction="row" spacing={3}>
            <FormComponent.ControlledTextField
              name="code"
              sx={{ flex: 1 }}
              control={control}
              label={t('debtTypeOrgCreate.configuration.code.label')}
              noAdornment
            />
            <Stack flex={3}>
              <FormComponent.ControlledTextField
                name="description"
                control={control}
                label={t('debtTypeOrgCreate.configuration.description.label')}
                adornment={`${description?.length || 0}/100`}
              />
              <Typography variant="caption" px={1.5}>
                {t('debtTypeOrgCreate.configuration.description.caption')}
              </Typography>
            </Stack>
          </Stack>
        </SectionBox>
      </WizardStepWrapper>

      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
