import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { FormProvider } from 'react-hook-form';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { PageRoutes } from '../../routes';
import { useStore } from '../../store/GlobalStore';
import { createAssessment } from '../../api/assessments';
import { useStepperLogic } from '../../hooks/useStepperLogic';
import { Step1Configuration } from './components/Step1Configuration';
import { Step2Payments } from './components/Step2Payments';
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

type AssessmentFormData = z.infer<typeof assessmentFormSchema> & {
  addPaymentsToAssessment?: boolean;
};

export const AssessmentCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { organizationId }
  } = useStore();

  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep
  } = useStepperLogic({ initialStep: 0, totalSteps: 2 });

  const createAssessmentMutation = createAssessment(organizationId);

  const methods = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      assessmentName: '',
      debtPositionTypeOrgCode: '',
      addPaymentsToAssessment: false
    }
  });

  const { getValues, clearErrors, trigger } = methods;

  const validateStep = (step: number, values: AssessmentFormData) => {
    switch (step) {
      case 0:
        return {
          isValid: !!values.assessmentName && !!values.debtPositionTypeOrgCode,
          fields: ['assessmentName', 'debtPositionTypeOrgCode'] as const
        };
      case 1:
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
        await trigger(fields);
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
    isLastStep,
    goToNextStep,
    trigger,
    handleSubmit
  ]);

  const handleBack = () => {
    if (isFirstStep) {
      navigate(PageRoutes.ASSESSMENTS);
    } else {
      goToPreviousStep();
    }
  };

  const steps: Stepper['steps'] = useMemo(
    () => [
      {
        label: t('assessmentCreate.stepper.step1'),
        content: <Step1Configuration key="step1" />
      },
      {
        label: t('assessmentCreate.stepper.step2'),
        optional: true,
        content: <Step2Payments key="step2" />
      }
    ],
    [t]
  );

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
