import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { FormProvider, useWatch } from 'react-hook-form';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { PageRoutes } from '../../routes';
import { useStore } from '../../store/GlobalStore';
import { createAssessment } from '../../api/assessments';
import { useStepperLogic } from '../../hooks/useStepperLogic';
import { Step1Configuration } from './components/Step1Configuration';
import {
  Step2Payments,
  validateStep2Payments,
  Step2PaymentsRef
} from './components/Step2Payments';
import { Step3AssignChapter } from './components/Step3AssignChapter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import utils from '../../utils';
import { AxiosError } from 'axios';

const assessmentFormSchema = z.object({
  assessmentName: z
    .string({
      required_error:
        'assessmentCreate.configuration.step1.fields.name.required'
    })
    .min(1, 'assessmentCreate.configuration.step1.fields.name.required'),
  debtPositionTypeOrgCode: z
    .string({
      required_error:
        'assessmentCreate.configuration.step1.fields.debtPositionType.required'
    })
    .min(
      1,
      'assessmentCreate.configuration.step1.fields.debtPositionType.required'
    )
});

// Conditional schema for step 3 - applied only when addPaymentsToAssessment is true
const step3Schema = z.object({
  operatingYear: z
    .string({
      required_error:
        'assessmentCreate.configuration.step3.fields.operatingYear.required'
    })
    .min(
      1,
      'assessmentCreate.configuration.step3.fields.operatingYear.required'
    ),
  chapterCode: z
    .string({
      required_error:
        'assessmentCreate.configuration.step3.fields.chapter.required'
    })
    .min(1, 'assessmentCreate.configuration.step3.fields.chapter.required')
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema> & {
  addPaymentsToAssessment?: boolean;
  selectedPayments?: Array<string>;
  operatingYear?: string;
  chapterCode?: string;
};

export const AssessmentCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { organizationId }
  } = useStore();

  // Dynamic calculation of totalSteps based on the form values
  const methods = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      assessmentName: '',
      debtPositionTypeOrgCode: '',
      addPaymentsToAssessment: false,
      selectedPayments: [],
      operatingYear: '',
      chapterCode: ''
    }
  });

  // Monitor the value to calculate the number of steps and always convert it to boolean
  const addPaymentsToAssessmentRaw = useWatch({
    control: methods.control,
    name: 'addPaymentsToAssessment'
  });

  // Always convert to boolean for consistency
  const addPaymentsToAssessment =
    addPaymentsToAssessmentRaw === true ||
    String(addPaymentsToAssessmentRaw) === 'true';

  // Dynamic calculation of totalSteps using only booleans
  const totalSteps = addPaymentsToAssessment ? 3 : 2;

  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep
  } = useStepperLogic({ initialStep: 0, totalSteps });

  const createAssessmentMutation = createAssessment(organizationId);

  const { getValues, clearErrors, trigger, setError } = methods;

  // Ref per controllare la validazione del Step2Payments
  const step2PaymentsRef = useRef<Step2PaymentsRef>(null);

  const validateStep = (step: number, values: AssessmentFormData) => {
    switch (step) {
      case 0:
        return {
          isValid: !!values.assessmentName && !!values.debtPositionTypeOrgCode,
          fields: ['assessmentName', 'debtPositionTypeOrgCode'] as const
        };
      case 1:
        return {
          isValid: validateStep2Payments(values),
          fields: [] as const
        };
      case 2:
        // Step 3 - Assign Chapter: conditional validation only if addPaymentsToAssessment is true
        if (addPaymentsToAssessment) {
          // Year is always required, Chapter is required only if Year is selected
          const yearValid = !!values.operatingYear;
          const chapterValid = !values.operatingYear || !!values.chapterCode;

          return {
            isValid: yearValid && chapterValid,
            fields: ['operatingYear', 'chapterCode'] as const
          };
        }
        return {
          isValid: true,
          fields: [] as const
        };
      default:
        return { isValid: false, fields: [] as const };
    }
  };

  const handleSubmit = async (values: AssessmentFormData) => {
    try {
      const response = await createAssessmentMutation.mutateAsync({
        assessmentName: values.assessmentName,
        debtPositionTypeOrgCode: values.debtPositionTypeOrgCode
      });

      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'assessment-create',
          i18nParams: {
            assessmentName: response.assessmentName
          },
          assessmentId: response.assessmentId
        }
      });
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 409) {
        utils.notify.emit(t('assessmentCreate.error.nameAlreadyPresent'));
        return;
      }

      navigate(PageRoutes.RESPONSES_ERROR, {
        replace: true,
        state: {
          errorType: 'default'
        }
      });
    }
  };

  const handleNext = useCallback(async () => {
    try {
      clearErrors();
      const values = getValues();

      const { isValid, fields } = validateStep(currentStep, values);

      if (!isValid) {
        if (currentStep === 2 && addPaymentsToAssessment) {
          // Conditional validation: only enabled fields
          const fieldsToValidate: Array<'operatingYear' | 'chapterCode'> = [
            'operatingYear'
          ];
          if (values.operatingYear) {
            fieldsToValidate.push('chapterCode');
          }

          try {
            step3Schema.parse({
              operatingYear: values.operatingYear,
              chapterCode: values.chapterCode
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                const fieldName = err.path[0] as
                  | 'operatingYear'
                  | 'chapterCode';
                if (fieldsToValidate.includes(fieldName)) {
                  setError(fieldName, {
                    type: 'manual',
                    message: t(err.message)
                  });
                }
              });
            }
          }
        } else if (currentStep === 1) {
          // For step 2 payments, show validation error if selection is invalid
          if (step2PaymentsRef.current) {
            step2PaymentsRef.current.showValidationError(true);
          }
        } else {
          await trigger(fields);
        }
        return;
      }

      if (isLastStep) {
        await handleSubmit(values);
      } else {
        goToNextStep();
      }
    } catch (e) {
      console.error('Error in handleNext:', e);
      utils.notify.emit(t('errors.generic'));
    }
  }, [
    clearErrors,
    getValues,
    currentStep,
    addPaymentsToAssessment,
    isLastStep,
    goToNextStep,
    trigger,
    setError,
    handleSubmit,
    t
  ]);

  const handleBack = () => {
    if (isFirstStep) {
      navigate(PageRoutes.ASSESSMENTS);
    } else {
      goToPreviousStep();
    }
  };

  const steps: Stepper['steps'] = useMemo(() => {
    const baseSteps = [
      {
        label: t('assessmentCreate.stepper.step1'),
        content: <Step1Configuration key="step1" />
      },
      {
        label: t('assessmentCreate.stepper.step2'),
        optional: true,
        content: <Step2Payments key="step2" ref={step2PaymentsRef} />
      }
    ];

    // Add the third step only if addPaymentsToAssessment is true
    if (addPaymentsToAssessment) {
      baseSteps.push({
        label: t('assessmentCreate.stepper.step3'),
        content: <Step3AssignChapter key="step3" />
      });
    }

    return baseSteps;
  }, [t, addPaymentsToAssessment]);

  return (
    <FormProvider {...methods}>
      <form aria-label={t('assessmentCreate.formLabel')} role="form" noValidate>
        <StepperContainer
          title={t('assessmentCreate.title')}
          description={t('assessmentCreate.description')}
          steps={steps}
          activeStep={currentStep}
        />

        <WizardStepButtons
          onBack={handleBack}
          onNext={handleNext}
          nextLabel={isLastStep ? t('commons.create') : t('commons.continue')}
        />
      </form>
    </FormProvider>
  );
};
