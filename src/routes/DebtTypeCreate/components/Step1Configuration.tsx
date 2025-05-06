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
import { DebtPositionTypeRequestBody } from '../../../../generated/data-contracts';

export type Step1Data = Partial<DebtPositionTypeRequestBody> &
  Pick<
    DebtPositionTypeRequestBody,
    | 'description'
    | 'code'
    | 'orgType'
    | 'macroArea'
    | 'serviceType'
    | 'collectingReason'
    | 'taxonomyCode'
  >;

export type Step1Props = {
  setData: (data: Step1Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    code: z
      .string()
      .nonempty(t('debtTypeCreate.configuration.debtTypeCode.required')),
    description: z
      .string()
      .nonempty(t('debtTypeCreate.configuration.debtType.required'))
      .max(100, t('debtTypeCreate.configuration.debtType.maxCharacters')),
    orgType: z.string({
      required_error: t(
        'debtTypeCreate.configuration.organizationType.required'
      )
    }),
    macroArea: z.string({
      required_error: t('debtTypeCreate.configuration.macroArea.required')
    }),
    serviceType: z.string({
      required_error: t('debtTypeCreate.configuration.serviceType.required')
    }),
    collectingReason: z.string({
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
    'orgType',
    'macroArea',
    'serviceType',
    'collectingReason',
    'taxonomyCode'
  ];

  const { keys } = useFormDependencies({ form, fieldOrder });

  const organizationType = watch('orgType');
  const macroAreaCode = watch('macroArea');
  const serviceTypeCode = watch('serviceType');
  const collectionReason = watch('collectingReason');

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
              name="code"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormComponent.TextField
                  {...field}
                  sx={{ flex: 1 }}
                  ref={null}
                  required
                  label={t('debtTypeCreate.configuration.debtTypeCode.label')}
                  id="code"
                  error={!!errors.code}
                  helperText={errors.code?.message}
                  noAdornment
                />
              )}
            />
            <Stack flex={3}>
              <Controller
                name="description"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormComponent.TextField
                    {...field}
                    ref={null}
                    required
                    label={t('debtTypeCreate.configuration.debtType.label')}
                    id="description"
                    placeholder={t(
                      'debtTypeCreate.configuration.debtType.placeholder'
                    )}
                    error={!!errors.description}
                    helperText={errors.description?.message}
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
            name="orgType"
            fetchFn={getOrganizationsTypes}
            key={keys.orgType}
          />

          <Stack
            visibility={isVisible ? 'visible' : 'hidden'}
            display={isVisible ? 'flex' : 'none'}
            gap={2}
          >
            <FormComponent.ControlledSelect
              control={control}
              label={t('debtTypeCreate.configuration.macroArea.label')}
              name="macroArea"
              fetchFn={() => getMacroAreas({ organizationType })}
              key={keys.macroArea}
              disabled={!organizationType}
            />

            <Stack direction="row" gap={2}>
              <FormComponent.ControlledSelect
                control={control}
                label={t('debtTypeCreate.configuration.serviceType.label')}
                name="serviceType"
                fetchFn={() =>
                  getServiceTypes({ organizationType, macroAreaCode })
                }
                key={keys.serviceType}
                disabled={!macroAreaCode || !organizationType}
              />

              <FormComponent.ControlledSelect
                control={control}
                label={t('debtTypeCreate.configuration.collectionReason.label')}
                name="collectingReason"
                fetchFn={() =>
                  getCollectionReasons({
                    organizationType,
                    serviceTypeCode,
                    macroAreaCode
                  })
                }
                key={keys.collectingReason}
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
