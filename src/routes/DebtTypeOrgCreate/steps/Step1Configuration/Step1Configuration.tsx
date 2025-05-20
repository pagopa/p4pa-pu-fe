import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TFunction } from 'i18next';
import { z } from 'zod';

import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import { useStore } from '../../../../store/GlobalStore';
import { useDebtPositionTypesByOrg } from '../../../../hooks/useDebtPositionTypesByOrg';
import { DebtTypeOrgForm } from '../..';
import { useEffect } from 'react';

export type Step1Props = {
  onNext: () => void;
  onBack: () => void;
};

export const step1Schema = (t: TFunction) =>
  z.object({
    debtPositionTypeId: z.number({
      required_error: t('debtTypeOrgCreate.configuration.debtType.required')
    }),
    code: z
      .string()
      .nonempty(t('debtTypeOrgCreate.configuration.code.required')),
    description: z
      .string()
      .nonempty(t('debtTypeOrgCreate.configuration.description.required'))
      .max(100, t('debtTypeOrgCreate.configuration.description.maxCharacters'))
  });

export const Step1Configuration = ({ onNext, onBack }: Step1Props) => {
  const { t } = useTranslation();

  const {
    state: { organizationId }
  } = useStore();
  const { optionsMap, data } = useDebtPositionTypesByOrg({
    organizationId
  });

  const { control, watch, setValue } = useFormContext<DebtTypeOrgForm>();

  const description = watch('description');

  // Watch the selected debtPositionTypeId
  const selectedId = watch('debtPositionTypeId');

  // Auto-fill other fields when selection changes
  useEffect(() => {
    const selectedType = data?.find(
      (d) => d.debtPositionTypeId === Number(selectedId)
    );
    if (selectedType) {
      Object.entries(selectedType).forEach(([key, val]) => {
        setValue(key as keyof DebtTypeOrgForm, val);
      });
    }
  }, [selectedId, data, setValue]);

  return (
    <>
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

      <WizardStepButtons onBack={onBack} onNext={onNext} />
    </>
  );
};
