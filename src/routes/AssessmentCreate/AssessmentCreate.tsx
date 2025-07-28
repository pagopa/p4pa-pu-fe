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
import utils from '../../utils';
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
  selectedPaymentIuds?: Array<string>;
  operatingYear?: string;
  chapterCode?: string;
  assessmentRegistryId?: number;
};

export const AssessmentCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { organizationId }
  } = useStore();

  const methods = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      assessmentName: '',
      debtPositionTypeOrgCode: '',
      addPaymentsToAssessment: false,
      selectedPayments: [],
      selectedPaymentIuds: [],
      operatingYear: '',
      chapterCode: '',
      assessmentRegistryId: undefined
    }
  });

  const addPaymentsToAssessmentRaw = useWatch({
    control: methods.control,
    name: 'addPaymentsToAssessment'
  });

  const addPaymentsToAssessment =
    addPaymentsToAssessmentRaw === true ||
    String(addPaymentsToAssessmentRaw) === 'true';

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

  const step2PaymentsRef = useRef<Step2PaymentsRef>(null);

  const getAssessmentRegistryIdFromChapter = async (
    values: AssessmentFormData
  ): Promise<number | undefined> => {
    return values.assessmentRegistryId;
  };

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
      // STEP 1: Create always the standard assessment
      const response = await createAssessmentMutation.mutateAsync({
        assessmentName: values.assessmentName,
        debtPositionTypeOrgCode: values.debtPositionTypeOrgCode
      });
      const assessmentId = response.assessmentId;
      if (!assessmentId) {
        throw new Error('Assessment ID not received from the response');
      }
      // STEP 2: If there are selected payments, create also assessment-details
      if (
        addPaymentsToAssessment &&
        values.selectedPaymentIuds &&
        values.selectedPaymentIuds.length > 0
      ) {
        const assessmentRegistryId =
          await getAssessmentRegistryIdFromChapter(values);

        if (!assessmentRegistryId) {
          throw new Error(
            'Assessment Registry ID not found for the selected chapter'
          );
        }

        await utils.apiClient.bff.createAssessmentsDetail(
          organizationId,
          assessmentId,
          {
            assessmentRegistryId,
            iuds: values.selectedPaymentIuds
          }
        );
      }

      // STEP 3: Final navigation
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
      console.error('Error during creation:', error);

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

  // Conditional navigation logic for the wizard
  const handleNext = useCallback(async () => {
    try {
      clearErrors();
      const values = getValues();

      const { isValid, fields } = validateStep(currentStep, values);

      if (!isValid) {
        if (currentStep === 2 && addPaymentsToAssessment) {
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
          if (step2PaymentsRef.current) {
            step2PaymentsRef.current.showValidationError(true);
          }
        } else {
          await trigger(fields);
        }
        return;
      }

      // LOGIC CONDITIONAL STEP 2 - Point of bifurcation of the flow
      if (currentStep === 1) {
        if (addPaymentsToAssessment) {
          goToNextStep();
        } else {
          await handleSubmit(values);
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

  const getNextButtonLabel = () => {
    if (currentStep === 1) {
      return addPaymentsToAssessment
        ? t('commons.continue')
        : t('commons.create');
    }
    return isLastStep ? t('commons.create') : t('commons.continue');
  };

  const step1Component = useMemo(() => <Step1Configuration />, []);
  const step2Component = useMemo(
    () => <Step2Payments ref={step2PaymentsRef} isActive={currentStep === 1} />,
    [currentStep]
  );
  const step3Component = useMemo(() => <Step3AssignChapter />, []);

  const steps: Stepper['steps'] = useMemo(() => {
    const baseSteps = [
      {
        label: t('assessmentCreate.stepper.step1'),
        content: step1Component
      },
      {
        label: t('assessmentCreate.stepper.step2'),
        optional: true,
        content: step2Component
      }
    ];

    if (addPaymentsToAssessment) {
      baseSteps.push({
        label: t('assessmentCreate.stepper.step3'),
        content: step3Component
      });
    }

    return baseSteps;
  }, [
    t,
    addPaymentsToAssessment,
    step1Component,
    step2Component,
    step3Component
  ]);

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
          nextLabel={getNextButtonLabel()}
        />
      </form>
    </FormProvider>
  );
};
