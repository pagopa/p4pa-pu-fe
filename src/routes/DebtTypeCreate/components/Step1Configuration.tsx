import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import LocalOffer from '@mui/icons-material/LocalOffer';
import BookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import { DebtPositionTypeDetailDTO } from '../../../../generated/data-contracts';
import { TaxonomyFilter } from '../../../components/TaxonomyFilter';
import { TaxonomyEdit } from './components/TaxonomyEdit';
import { TaxonomyFields } from '../../../models/Taxonomy';
import { step1Schema } from './schema';

export type Step1Data = TaxonomyFields & {
  description: string;
  code: string;
  isCodeUnique?: boolean;
};

export type Step1Props = {
  onNext: () => void;
  onBack: () => void;
  editmode?: boolean;
  prefilledData?: DebtPositionTypeDetailDTO;
  formMethods?: Partial<{
    getValues: () => Step1Data;
    setError: (
      name: keyof Step1Data,
      error: { type: string; message: string }
    ) => void;
    clearErrors: () => void;
    trigger: (name?: keyof Step1Data) => Promise<boolean>;
    setValue: (
      name: keyof Step1Data,
      value: unknown,
      options?: { shouldValidate?: boolean }
    ) => void;
  }>;
};

export const Step1Configuration = ({
  onNext,
  onBack,
  editmode = false,
  prefilledData = undefined,
  formMethods
}: Step1Props) => {
  const { t } = useTranslation();

  const form = useForm<Step1Data>({
    resolver: editmode ? undefined : zodResolver(step1Schema),
    mode: 'onTouched'
  });

  const { control, getValues, setError, clearErrors, trigger, setValue } = form;

  // Monitor the code field to reset isCodeUnique when it changes
  const codeValue = useWatch({ control, name: 'code' });
  const prevCodeValueRef = useRef<string | undefined>(undefined);
  const descriptionValue = useWatch({ control, name: 'description' });

  // Reset isCodeUnique when the code changes
  useEffect(() => {
    // Only reset if the code value has actually changed (not on first render)
    if (
      prevCodeValueRef.current !== undefined &&
      codeValue !== prevCodeValueRef.current
    ) {
      setValue('isCodeUnique', undefined, { shouldValidate: false });
    }
    prevCodeValueRef.current = codeValue;
  }, [codeValue, setValue]);

  // Expose the form methods to the parent component if requested
  useEffect(() => {
    if (formMethods) {
      formMethods.getValues = getValues;
      formMethods.setError = setError as (
        name: keyof Step1Data,
        error: { type: string; message: string }
      ) => void;
      formMethods.clearErrors = clearErrors;
      formMethods.trigger = trigger as (
        name?: keyof Step1Data
      ) => Promise<boolean>;
      formMethods.setValue = setValue as (
        name: keyof Step1Data,
        value: unknown,
        options?: { shouldValidate?: boolean }
      ) => void;
    }
  }, [formMethods, getValues, setError, clearErrors, trigger, setValue]);

  return (
    <FormProvider {...form} data-testid="step1-configuration">
      <form aria-label="form">
        <WizardStepWrapper
          title={t('debtTypeCreate.configuration.title')}
          subtitle={t('debtTypeCreate.configuration.subtitle')}
          alertMessage={
            (!editmode && t('debtTypeCreate.configuration.alertMessage')) || ''
          }
        >
          <SectionBox
            data-testid="step1-configuration-debt-type"
            title={t('debtTypeCreate.configuration.debtType.title')}
            adornment={<BookIcon />}
          >
            <Stack direction="row" spacing={3}>
              <FormComponent.ControlledTextField
                name="code"
                control={control}
                sx={{ flex: 1 }}
                label={t('debtTypeCreate.configuration.debtTypeCode.label')}
                data-testid="code"
                defaultValue={editmode ? prefilledData?.code : ''}
                disabled={editmode}
                required={!editmode}
                inputProps={{ maxLength: 255 }}
              />
              <Stack flex={3}>
                <FormComponent.ControlledTextField
                  name="description"
                  control={control}
                  label={t('debtTypeCreate.configuration.debtType.label')}
                  data-testid="description"
                  placeholder={t(
                    'debtTypeCreate.configuration.debtType.placeholder'
                  )}
                  inputProps={{ maxLength: 100 }}
                  adornment={`${descriptionValue?.length || 0}/100`}
                  defaultValue={editmode ? prefilledData?.description : ''}
                  disabled={editmode}
                  required={!editmode}
                />
                <Typography variant="caption" px={1.5}>
                  {t('debtTypeCreate.configuration.debtType.helper')}
                </Typography>
              </Stack>
            </Stack>
          </SectionBox>
          <SectionBox
            data-testid="step1-configuration-taxonomy"
            title={t('debtTypeCreate.configuration.taxonomy.title')}
            adornment={<LocalOffer />}
          >
            {editmode ? (
              <TaxonomyEdit prefilledData={prefilledData} />
            ) : (
              <TaxonomyFilter
                requiredFields={true}
                disableFieldReset={false}
                render={(fields) => (
                  <Stack
                    gap={2}
                    data-testid="step1-configuration-taxonomy-fields"
                  >
                    {/* orgType is always visible */}
                    {fields.orgType}
                    {/* 
                      In creation mode (requiredFields=true), show all fields to allow validation errors
                      In search mode, show fields only if orgType is selected
                    */}
                    <Stack direction="row" gap={2}>
                      {fields.macroAreaCode}
                      {fields.serviceTypeCode}
                    </Stack>
                    <Stack direction="row" gap={2}>
                      {fields.collectingReason}
                      {fields.taxonomyCode}
                    </Stack>
                  </Stack>
                )}
              />
            )}
          </SectionBox>
        </WizardStepWrapper>

        <WizardStepButtons
          onBack={onBack}
          onNext={async () => {
            // First validate the base form (Zod)
            const isValid = await trigger();
            if (!isValid) {
              return;
            }
            // Then call onNext that will handle the code validation and saving
            onNext();
          }}
        />
      </form>
    </FormProvider>
  );
};
