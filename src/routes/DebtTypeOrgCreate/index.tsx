import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { Step1Configuration } from './steps/Step1Configuration';
import { Step2Behaviour } from './steps/Step2Behaviour';
import { Step3Accounting } from './steps/Step3Accounting';
import { Step4Notifications } from './steps/Step4Notifications';
import { Step5Operators } from './steps/Step5Operators';
import { FieldPath, FormProvider } from 'react-hook-form';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { DebtTypeOrgForm } from './types';
import { useStepperLogic } from '../../hooks/useStepperLogic';
import { useDebtTypeOrgForm } from './hooks/useDebtTypeOrgForm';
import { useDebtPositionTypeOrgSearch } from '../../api/debtTypesCreated';
import { useStore } from '../../store/GlobalStore';
import utils from '../../utils';

export type DebtTypeOrgCreateProps = {
  edit?: boolean;
};

export const DebtTypeOrgCreate = ({ edit = false }: DebtTypeOrgCreateProps) => {
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
  } = useStepperLogic({ initialStep: 0, totalSteps: 5 });

  // Navigation helpers
  const onSuccess = (paymentObject: string) => {
    const category = edit ? 'debt-type-org-update' : 'debt-type-org-create';

    navigate(PageRoutes.RESPONSES_SUCCESS, {
      replace: true,
      state: {
        category,
        i18nParams: {
          paymentObject
        }
      }
    });
  };

  const { methods, validateStep, handleSubmit } = useDebtTypeOrgForm({
    edit,
    onSuccess
  });

  const { getValues, setError, clearErrors } = methods;

  const DebtPositionTypeOrgSearchMutation =
    useDebtPositionTypeOrgSearch(organizationId);

  const handleNext = useCallback(async () => {
    try {
      clearErrors();
      const values = getValues();

      // code validation
      let isCodeUnique: boolean | undefined;
      if (currentStep === 0) {
        const response = await DebtPositionTypeOrgSearchMutation.mutateAsync({
          filters: { code: values.code },
          pagination: { page: 0, size: 1 },
          sort: []
        });
        isCodeUnique = response.content.length === 0;
      }

      const { isValid, errors } = validateStep(currentStep, {
        ...values,
        isCodeUnique
      });

      if (!isValid) {
        errors.forEach(({ path, message }) => {
          if (path.length > 0) {
            setError(path.join('.') as FieldPath<DebtTypeOrgForm>, {
              type: 'manual',
              message
            });
          }
        });
        return;
      }

      if (isLastStep) {
        await handleSubmit(values);
      } else {
        goToNextStep();
      }
    } catch (e) {
      console.error(e);
      utils.notify.emit(t('errors.generic'));
    }
  }, [
    clearErrors,
    getValues,
    validateStep,
    setError,
    isLastStep,
    handleSubmit,
    goToNextStep
  ]);

  const handleBack = () => {
    if (isFirstStep) {
      navigate(-1);
    } else {
      goToPreviousStep();
    }
  };

  // Stepper configuration
  const stepperSteps: Stepper['steps'] = useMemo(
    () => [
      {
        label: t('debtTypeOrgCreate.stepper.step1'),
        content: <Step1Configuration key="step1" edit={edit} />
      },
      {
        label: t('debtTypeOrgCreate.stepper.step2'),
        content: <Step2Behaviour key="step2" edit={edit} />
      },
      {
        label: t('debtTypeOrgCreate.stepper.step3'),
        content: <Step3Accounting key="step3" edit={edit} />
      },
      {
        label: t('debtTypeOrgCreate.stepper.step4'),
        content: <Step4Notifications key="step4" />,
        optional: true
      },
      {
        label: t('debtTypeOrgCreate.stepper.step5'),
        content: <Step5Operators key="step5" edit={edit} />
      }
    ],
    [t, edit]
  );

  return (
    <FormProvider {...methods}>
      <form
        aria-label={t('debtTypeOrgCreate.formLabel')}
        role="form"
        noValidate
      >
        <StepperContainer
          title={t(
            edit ? 'debtTypeOrgCreate.edit.title' : 'debtTypeOrgCreate.title'
          )}
          steps={stepperSteps}
          activeStep={currentStep}
        />

        <WizardStepButtons
          onBack={handleBack}
          onNext={handleNext}
          nextLabel={
            isLastStep ? 'debtTypeOrgCreate.submit' : 'commons.continue'
          }
        />
      </form>
    </FormProvider>
  );
};
