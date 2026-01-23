/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import { Step1Configuration, Step1Data } from './components/Step1Configuration';
import { Step2Data, Step2Settings } from './components/Step2Settings';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { useSignal } from '@preact/signals-react';
import {
  postDebtPositionType,
  useDebtPositionTypeCodeValidation
} from '../../api/debtPositionsTypes';
import { DebtPositionTypeRequestBody } from '../../../generated/data-contracts';
import { useStore } from '../../store/GlobalStore';
import utils from '../../utils';

const initialData: DebtPositionTypeRequestBody = {
  code: '',
  description: '',
  orgType: '',
  macroArea: '',
  serviceType: '',
  collectingReason: '',
  taxonomyCode: '',
  flagMandatoryDueDate: false,
  flagAnonymousFiscalCode: false,
  flagNotifyIo: false,
  ioTemplateSubject: '',
  ioTemplateMessage: ''
};

export const DebtTypeCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    state: { organizationId }
  } = useStore();

  const [step, setStep] = useState(0);
  const formData = useSignal<DebtPositionTypeRequestBody>(initialData);
  const debtTypeCreate = postDebtPositionType();

  // Mutable object to access the form methods of Step1Configuration
  // Using Partial<> to make methods optional until Step1Configuration initializes them
  const step1FormMethods = useRef<
    Partial<{
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
    }>
  >({});

  // Mutation to check the uniqueness of the code
  const codeValidationMutation =
    useDebtPositionTypeCodeValidation(organizationId);

  // Handles the transition to the next step with code validation
  const handleStep1Next = useCallback(async () => {
    try {
      const methods = step1FormMethods.current;

      // Methods are guaranteed to be available at this point since Step1Configuration
      // initializes them synchronously via useEffect after mount
      if (
        !methods.getValues ||
        !methods.clearErrors ||
        !methods.trigger ||
        !methods.setValue
      ) {
        return;
      }

      const { getValues, clearErrors, trigger, setValue } = methods;

      clearErrors();
      const values = getValues();

      // Check the uniqueness of the code only if it has been inserted
      let isCodeUnique: boolean | undefined;
      if (values.code && values.code.trim()) {
        isCodeUnique = await codeValidationMutation.mutateAsync(values.code);
        // Set isCodeUnique in the form values for Zod validation
        // Use shouldValidate: false to avoid premature validation
        setValue('isCodeUnique', isCodeUnique, { shouldValidate: false });
      }

      // Trigger the complete validation for all fields
      // This includes the code field validation with isCodeUnique check via superRefine
      const isValid = await trigger();

      if (!isValid) {
        return;
      }

      // Save the data in formData before proceeding
      // Exclude isCodeUnique as it's not part of DebtPositionTypeRequestBody
      // eslint-disable-next-line sonarjs/no-unused-vars
      const { isCodeUnique: _, ...dataToSave } = values;
      formData.value = { ...formData.value, ...dataToSave };

      // If everything is valid, proceed to the next step
      setStep(1);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('errors.generic'));
    }
  }, [codeValidationMutation, t, formData]);

  const submit = async () => {
    try {
      const response = await debtTypeCreate.mutateAsync(formData.value);
      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'debt-type-catalog-create',
          i18nParams: {
            paymentObject: response.description
          }
        }
      });
    } catch (error) {
      console.error(error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  };

  const steps: Stepper['steps'] = [
    {
      label: t('debtTypeCreate.stepper.step1'),
      content: (
        <Step1Configuration
          key="step1"
          onNext={handleStep1Next}
          onBack={() => navigate(PageRoutes.DEBT_TYPES_CATALOG)}
          formMethods={step1FormMethods.current}
        />
      )
    },
    {
      label: t('debtTypeCreate.stepper.step2'),
      optional: true,
      content: (
        <Step2Settings
          key="step2"
          setData={(data: Step2Data) => {
            formData.value = { ...formData.value, ...data };
          }}
          onBack={() => setStep(0)}
          onNext={submit}
        />
      )
    }
  ];

  return (
    <StepperContainer
      title={t('debtTypeCreate.title')}
      description={t('debtTypeCreate.description')}
      steps={steps}
      activeStep={step}
    />
  );
};
