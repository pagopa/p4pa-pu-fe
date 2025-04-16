import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import { Step1Configuration, Step1Data } from './components/Step1Configuration';
import { Step2Data, Step2Settings } from './components/Step2Settings';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../App';
import { useSignal } from '@preact/signals-react';

type FormData = {
  step1: Step1Data;
  step2: Step2Data;
};

const initialData: FormData = {
  step1: {
    debtPositionType: '',
    taxonomy: ''
  },
  step2: {
    option1: false,
    option2: false,
    option3: false,
    checkbox2: false,
    textField: '',
    textArea: ''
  }
};

export const DebtTypeCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const formData = useSignal<FormData>(initialData);

  const submit = () => {
    navigate(PageRoutes.DEBT_TYPE_CREATE_SUCCESS, {
      replace: true,
      state: {
        formData: formData.value
      }
    });
  };

  const steps: Stepper['steps'] = [
    {
      label: t('debtTypeCreate.stepper.step1'),
      content: (
        <Step1Configuration
          key="step1"
          setData={(data: Step1Data) => {
            formData.value = { ...formData.value, step1: data };
          }}
          onNext={() => setStep(1)}
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
            formData.value = { ...formData.value, step2: data };
          }}
          onBack={() => setStep(0)}
          onNext={submit}
        />
      )
    }
  ];

  return (
    <StepperContainer
      title={t('debtPositionCreateWizard.title')}
      description={t('debtPositionCreateWizard.description')}
      steps={steps}
      activeStep={step}
    />
  );
};
