import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import { Step1Configuration, Step1Data } from './components/Step1Configuration';
import { Step2Data, Step2Settings } from './components/Step2Settings';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { useSignal } from '@preact/signals-react';
import { postDebtPositionType } from '../../api/debtPositionsTypes';
import { DebtPositionTypeRequestBody } from '../../../generated/data-contracts';
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

  const [step, setStep] = useState(0);
  const formData = useSignal<DebtPositionTypeRequestBody>(initialData);
  const debtTypeCreate = postDebtPositionType();

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
          setData={(data: Step1Data) => {
            formData.value = { ...formData.value, ...data };
          }}
          onNext={() => setStep(1)}
          onBack={() => navigate(PageRoutes.DEBT_TYPES_CATALOG)}
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
