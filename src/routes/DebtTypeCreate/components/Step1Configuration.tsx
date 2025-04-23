import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import LocalOffer from '@mui/icons-material/LocalOffer';
import BookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TFunction } from 'i18next';
import { z } from 'zod';

import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import {
  getCollectionReasons,
  getMacroAreas,
  getOrganizationsTypes,
  getServiceTypes,
  getTaxonomyCode
} from '../../../api/taxonomy';
import { useFormDependencies } from '../../../hooks/useFormDependecies';

export type Step1Data = {
  debtPositionType: string;
  debtPositionTypeCode: string;
  organizationType: string;
  macroAreaCode: string;
  serviceTypeCode: string;
  collectionReason: string;
  taxonomyCode: string;
};

export type Step1Props = {
  setData: (data: Step1Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    debtPositionType: z
      .string()
      .nonempty(t('debtTypeCreate.configuration.debtType.required'))
      .max(100, t('debtTypeCreate.configuration.debtType.maxCharacters')),
    debtPositionTypeCode: z
      .string()
      .nonempty(t('debtTypeCreate.configuration.debtTypeCode.required')),
    organizationType: z.string({
      required_error: t(
        'debtTypeCreate.configuration.organizationType.required'
      )
    }),
    macroAreaCode: z.string({
      required_error: t('debtTypeCreate.configuration.macroArea.required')
    }),
    serviceTypeCode: z.string({
      required_error: t('debtTypeCreate.configuration.serviceType.required')
    }),
    collectionReason: z.string({
      required_error: t(
        'debtTypeCreate.configuration.collectionReason.required'
      )
    }),
    taxonomyCode: z.string({
      required_error: t('debtTypeCreate.configuration.taxonomyCode.required')
    })
  });

export const Step1Configuration = ({ setData, onNext, onBack }: Step1Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);

  const form = useForm<Step1Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = form;

  const fieldOrder: Array<keyof Step1Data> = [
    'organizationType',
    'macroAreaCode',
    'serviceTypeCode',
    'collectionReason',
    'taxonomyCode'
  ];

  const { keys } = useFormDependencies({ form, fieldOrder });

  const organizationType = watch('organizationType');
  const macroAreaCode = watch('macroAreaCode');
  const serviceTypeCode = watch('serviceTypeCode');
  const collectionReason = watch('collectionReason');

  const isVisible = !!organizationType;

  const onSubmit = async (values: Step1Data) => {
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
          <Stack direction="row" spacing={3}>
            <Controller
              name="debtPositionTypeCode"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormComponent.TextField
                  {...field}
                  sx={{ flex: 1 }}
                  ref={null}
                  required
                  label={t('debtTypeCreate.configuration.debtTypeCode.label')}
                  id="debtPositionTypeCode"
                  error={!!errors.debtPositionTypeCode}
                  helperText={errors.debtPositionTypeCode?.message}
                  adornment={''}
                />
              )}
            />
            <Stack flex={3}>
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
            </Stack>
          </Stack>
        </SectionBox>

        <SectionBox
          title={t('debtTypeCreate.configuration.taxonomyCode.title')}
          adornment={<LocalOffer />}
        >
          <FormComponent.ControlledSelect
            control={control}
            label={t('debtTypeCreate.configuration.organizationType.label')}
            name="organizationType"
            fetchFn={getOrganizationsTypes}
            key={keys.organizationType}
          />

          <Stack
            visibility={isVisible ? 'visible' : 'hidden'}
            display={isVisible ? 'flex' : 'none'}
            gap={2}
          >
            <FormComponent.ControlledSelect
              control={control}
              label={t('debtTypeCreate.configuration.macroArea.label')}
              name="macroAreaCode"
              fetchFn={() => getMacroAreas({ organizationType })}
              key={keys.macroAreaCode}
              disabled={!organizationType}
            />

            <Stack direction="row" gap={2}>
              <FormComponent.ControlledSelect
                control={control}
                label={t('debtTypeCreate.configuration.serviceType.label')}
                name="serviceTypeCode"
                fetchFn={() =>
                  getServiceTypes({ organizationType, macroAreaCode })
                }
                key={keys.serviceTypeCode}
                disabled={!macroAreaCode || !organizationType}
              />

              <FormComponent.ControlledSelect
                control={control}
                label={t('debtTypeCreate.configuration.collectionReason.label')}
                name="collectionReason"
                fetchFn={() =>
                  getCollectionReasons({
                    organizationType,
                    serviceTypeCode,
                    macroAreaCode
                  })
                }
                key={keys.collectionReason}
                disabled={
                  !serviceTypeCode || !macroAreaCode || !organizationType
                }
              />

              <FormComponent.ControlledSelect
                control={control}
                label={t('debtTypeCreate.configuration.taxonomyCode.label')}
                name="taxonomyCode"
                disabled={
                  !collectionReason ||
                  !serviceTypeCode ||
                  !macroAreaCode ||
                  !organizationType
                }
                fetchFn={() =>
                  getTaxonomyCode({
                    organizationType,
                    macroAreaCode,
                    serviceTypeCode,
                    collectionReason
                  })
                }
                key={keys.taxonomyCode}
              />
            </Stack>
          </Stack>
        </SectionBox>
      </WizardStepWrapper>

      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
