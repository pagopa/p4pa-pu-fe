import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper/types';
import { ZodError } from 'zod';
import { StepperContainer } from '../../components/Stepper';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../App';
import { Step1Configuration } from './steps/Step1Configuration';
import { Step2Behaviour } from './steps/Step2Behaviour';
import { Step3Accounting } from './steps/Step3Accounting';
import { Step4Notifications } from './steps/Step4Notifications';
import { PaymentMethodOption } from './steps/Step2Behaviour/components/PaymentMethodSelector';
import { OperatorsSelection } from '../../../generated/data-contracts';
import {
  CreateDebtPositionTypeOrg,
  createDebtPositionTypeOrg
} from '../../api/debtPositionsTypeOrg';
import { useStore } from '../../store/GlobalStore';
import utils from '../../utils';
import { FormProvider, useForm } from 'react-hook-form';
import { step2Schema } from './steps/Step2Behaviour/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema } from './steps/Step1Configuration/schema';
import { step3Schema } from './steps/Step3Accounting/schema';
import { step4Schema } from './steps/Step4Notifications/schema';
import { step5Schema } from './steps/Step5Operators/schema';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { DebtTypeOrgForm } from './types';
import { Step5Operators } from './steps/Step5Operators';

const initialData: DebtTypeOrgForm = {
  debtPositionTypeId: '',
  code: '',
  description: '',
  iban: '',
  operatorsSelection: OperatorsSelection.ALL,
  paymentMethod: PaymentMethodOption.FREE,
  enabledOperators: []
};

export const DebtTypeOrgCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { organizationId }
  } = useStore();

  const [step, setStep] = useState(0);

  const debtTypeCreate = createDebtPositionTypeOrg();

  const combinedSchema = useMemo(
    () =>
      step1Schema
        .and(step2Schema)
        .and(step3Schema)
        .and(step4Schema)
        .and(step5Schema),
    []
  );

  const stepSchemas = useMemo(
    () => [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema],
    []
  );

  const methods = useForm<DebtTypeOrgForm>({
    defaultValues: initialData,
    resolver: zodResolver(combinedSchema),
    mode: 'onTouched'
  });

  const { getValues, setError, clearErrors } = methods;

  const requestMap = useCallback(
    async (data: DebtTypeOrgForm): Promise<CreateDebtPositionTypeOrg> => ({
      organizationId,
      data: {
        debtPositionTypeOrg: {
          ...data,
          debtPositionTypeId: Number(data.debtPositionTypeId),
          organizationId,
          flagNotifyOutcomePush: data.flagNotifyOutcomePush === 'true',
          xsdDefinitionRef:
            data.paymentMethod === PaymentMethodOption.CUSTOM
              ? await data.xsdDefinitionRef?.text()
              : undefined
        },
        operatorsSelection: data.operatorsSelection,
        ...(data.operatorsSelection === OperatorsSelection.SELECTED &&
          data.enabledOperators &&
          data.enabledOperators.length > 0 && {
            enabledOperators: data.enabledOperators
          })
      }
    }),
    [organizationId]
  );

  const onSubmit = useCallback(
    async (formData: DebtTypeOrgForm) => {
      try {
        const request = await requestMap(formData);
        const response = await debtTypeCreate.mutateAsync(request);
        navigate(PageRoutes.RESPONSES_SUCCESS, {
          replace: true,
          state: {
            category: 'debt-type-org-create',
            i18nParams: {
              paymentObject: response.description
            }
          }
        });
      } catch (error) {
        utils.notify.emit(t('errors.generic'));
        console.error(error);
      }
    },
    [debtTypeCreate, navigate, requestMap, t]
  );

  const onNext = useCallback(async () => {
    if (debtTypeCreate.isPending) return;

    clearErrors();
    const currentSchema = stepSchemas[step];
    const values = getValues();

    try {
      currentSchema.parse(values);
      if (step === stepSchemas.length - 1) {
        await onSubmit(values);
      } else {
        setStep(step + 1);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        error.errors.forEach(({ path, message }) => {
          if (path.length > 0) {
            setError(path[0] as keyof DebtTypeOrgForm, {
              type: 'manual',
              message
            });
          }
        });
      }
    }
  }, [
    clearErrors,
    getValues,
    onSubmit,
    setError,
    step,
    stepSchemas,
    debtTypeCreate.isPending
  ]);

  const onBack = useCallback(() => {
    if (step === 0) {
      navigate(PageRoutes.DEBT_TYPES_CREATED);
    } else {
      setStep(step - 1);
    }
  }, [navigate, step]);

  const steps: Stepper['steps'] = useMemo(
    () => [
      {
        label: t('debtTypeOrgCreate.stepper.step1'),
        content: <Step1Configuration key="step1" />
      },
      {
        label: t('debtTypeOrgCreate.stepper.step2'),
        content: <Step2Behaviour key="step2" />
      },
      {
        label: t('debtTypeOrgCreate.stepper.step3'),
        content: <Step3Accounting key="step3" />
      },
      {
        label: t('debtTypeOrgCreate.stepper.step4'),
        content: <Step4Notifications key="step4" />,
        optional: true
      },
      {
        label: t('debtTypeOrgCreate.stepper.step5'),
        content: <Step5Operators key="step5" />
      }
    ],
    [t]
  );

  return (
    <FormProvider {...methods}>
      <form aria-label={t('debtTypeOrgCreate.formLabel')}>
        <StepperContainer
          title={t('debtTypeOrgCreate.title')}
          steps={steps}
          activeStep={step}
        />

        <WizardStepButtons
          onBack={onBack}
          onNext={onNext}
          disableNext={debtTypeCreate.isPending}
          aria-disabled={debtTypeCreate.isPending}
        />
      </form>
    </FormProvider>
  );
};
