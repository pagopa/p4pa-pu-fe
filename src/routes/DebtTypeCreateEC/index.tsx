import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import { Step1Configuration, Step1Data } from './components/Step1Configuration';
import { Step2Data, Step2Settings } from './components/Step2Settings';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../App';
import { useSignal } from '@preact/signals-react';
import { postDebtPositionType } from '../../api/debtPositionsTypes';
import { DebtPositionTypeRequestBody } from '../../../generated/data-contracts';
import React from 'react';

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

export const DebtTypeCreateEC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const formData = useSignal<DebtPositionTypeRequestBody>(initialData);
  const debtTypeCreateEC = postDebtPositionType();

  const submit = () => {
    debtTypeCreateEC.mutate(formData.value, {
      onSuccess: (formData) => {
        navigate(PageRoutes.DEBT_TYPE_CREATE_SUCCESS, {
          replace: true,
          state: {
            formData
          }
        });
      },
      onError: console.error
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
      content: <React.Fragment key="step2" />
    },
    {
      label: t('debtTypeCreateEC.stepper.step3'),
      content: <React.Fragment key="step3" />
    },
    {
      label: t('debtTypeCreateEC.stepper.step4'),
      optional: true,
      content: <React.Fragment key="step4" />
    },
    {
      label: t('debtTypeCreateEC.stepper.step5'),
      content: <React.Fragment key="step5" />
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
