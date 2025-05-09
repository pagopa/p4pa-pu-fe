import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../App';
import { useSignal } from '@preact/signals-react';
import { Step1Configuration, Step1Data } from './steps/Step1Configuration';
import { Step2Behaviour, Step2Data } from './steps/Step2Behaviour';
import { Step3Accounting, Step3Data } from './steps/Step3Accounting';
import { Step4Data, Step4Notifications } from './steps/Step4Notifications';
import {
  OperatorSelection,
  Step5Data,
  Step5Operators
} from './steps/Step5Operators';
import { PaymentMethodOption } from './steps/Step2Behaviour/components/PaymentMethodSelector';

type FormData = Step1Data & Step2Data & Step3Data & Step4Data & Step5Data;
const initialData: FormData = {
  debtType: 0,
  selection: '',
  operatorSelection: OperatorSelection.ALL,
  paymentMethod: PaymentMethodOption.FREE
};

export const DebtTypeCreateEC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const formData = useSignal<FormData>(initialData);

  const submit = () => {
    navigate(PageRoutes.DEBT_TYPE_CREATE_SUCCESS, {
      replace: true,
      state: {
        formData
      }
    });
  };

  const steps: Stepper['steps'] = [
    {
      label: t('debtTypeCreateEC.stepper.step1'),
      content: (
        <Step1Configuration
          key="step1"
          setData={(data: Step1Data) => {
            formData.value = { ...formData.value, ...data };
          }}
          onNext={() => setStep(1)}
          onBack={() => navigate(PageRoutes.DEBT_TYPES_CATALOG)}
        />
      )
    },
    {
      label: t('debtTypeCreateEC.stepper.step2'),
      content: (
        <Step2Behaviour
          key="step2"
          setData={(data: Step2Data) => {
            formData.value = { ...formData.value, ...data };
          }}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )
    },
    {
      label: t('debtTypeCreateEC.stepper.step3'),
      content: (
        <Step3Accounting
          key="step3"
          setData={(data: Step3Data) => {
            formData.value = { ...formData.value, ...data };
          }}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )
    },
    {
      label: t('debtTypeCreateEC.stepper.step4'),
      optional: true,
      content: (
        <Step4Notifications
          key="step4"
          setData={(data: Step4Data) => {
            formData.value = { ...formData.value, ...data };
          }}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )
    },
    {
      label: t('debtTypeCreateEC.stepper.step5'),
      content: (
        <Step5Operators
          key="step5"
          setData={(data: Step5Data) => {
            formData.value = { ...formData.value, ...data };
          }}
          onNext={submit}
          onBack={() => setStep(3)}
        />
      )
    }
  ];

  return (
    <StepperContainer
      title={t('debtTypeCreateEC.title')}
      description={t('debtTypeCreateEC.description')}
      steps={steps}
      activeStep={step}
    />
  );
};
