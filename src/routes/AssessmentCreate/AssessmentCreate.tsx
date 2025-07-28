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
import { useAssessmentNameValidation } from './hooks/useAssessmentNameValidation';

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
  const validateNameMutation = useAssessmentNameValidation(organizationId);

  const methods = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      assessmentName: '',
      debtPositionTypeOrgCode: '',
      addPaymentsToAssessment: false
    }
  });

  const { getValues, trigger, setError, clearErrors } = methods;

  const validateStep = async (
    step: number,
    values: AssessmentFormData
  ): Promise<boolean> => {
    switch (step) {
      case 0: {
        const zodSchemaValidationResult = await trigger([
          'assessmentName',
          'debtPositionTypeOrgCode'
        ]);

        if (!zodSchemaValidationResult) {
          return false;
        }

        try {
          clearErrors('assessmentName');

          const assessmentExists = await validateNameMutation.mutateAsync({
            assessmentName: values.assessmentName,
            debtPositionTypeOrgCode: values.debtPositionTypeOrgCode
          });

          if (assessmentExists) {
            setError('assessmentName', {
              type: 'manual',
              message: 'assessmentCreate.error.nameAlreadyPresent'
            });
            return false;
          }

          return true;
        } catch (error) {
          console.error('Error validating assessment:', error);
          setError('assessmentName', {
            type: 'manual',
            message: 'errors.generic'
          });
          return false;
        }
      }

      case 1:
        return true;

      default:
        return false;
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
      const values = getValues();

      const isStepValid = await validateStep(currentStep, values);

      if (!isStepValid) {
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
    getValues,
    currentStep,
    isLastStep,
    goToNextStep,
    handleSubmit,
    validateStep
  ]);

  const handleBack = () => {
    if (isFirstStep) {
      navigate(-1);
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
