import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Step1GeneralConfiguration from './components/Step/Step1GeneralConfiguration';
import Step2AddDebtor from './components/Step/Step2AddDebtor';
import Step3 from './components/Step/Step3';
import { StepperContainer } from '../../components/Stepper';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { PaymentOption } from '../../models/paymentTypes';
import { Step3Data, Step2Data, Step1Data } from '../../models/DebtPositionType';

type FormData = {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
};

const initialData: FormData = {
  step1: {
    debtPositionType: {
      value: '',
      readonly: false,
      flagMandatoryDueDate: false
    },
    description: {
      value: '',
      readonly: false
    }
  },
  step2: {
    subjectType: {
      value: '',
      readonly: false
    },
    taxCode: {
      value: '',
      readonly: false
    },
    fullName: {
      value: '',
      readonly: false
    },
    address: {
      value: '',
      readonly: false
    },
    civicNumber: {
      value: '',
      readonly: false
    },
    zipCode: {
      value: '',
      readonly: false
    },
    country: {
      value: '',
      readonly: false
    },
    province: {
      value: '',
      readonly: false
    },
    city: {
      value: '',
      readonly: false
    }
  },
  step3: {
    paymentObject: {
      value: '',
      readonly: false
    },
    paymentOption: {
      value: '' as PaymentOption,
      readonly: false
    },
    amount: {
      value: '',
      readonly: false
    },
    dueDate: {
      value: '',
      readonly: false
    },
    isMultibeneficiary: {
      value: false,
      readonly: false
    },
    flagMandatoryDueDate: false,
    beneficiaries: []
  }
};

const DebtPositionCreateWizard = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialData);

  return (
    <StepperContainer
      title={t('debtPositionCreateWizard.title')}
      description={t('debtPositionCreateWizard.description')}
      steps={[
        {
          label: t('debtPositionCreateWizard.wizardStepper.step1'),
          content: (
            <Step1GeneralConfiguration
              key="step1"
              data={formData.step1}
              setData={(data) => {
                setFormData((prev) => ({ ...prev, step1: data }));
              }}
              onNext={() => setStep(1)}
              onBack={() => navigate(PageRoutes.DEBT_POSITIONS)}
            />
          )
        },
        {
          label: t('debtPositionCreateWizard.wizardStepper.step2'),
          content: (
            <Step2AddDebtor
              key="step2"
              data={formData.step2}
              setData={(data) =>
                setFormData((prev) => ({ ...prev, step2: data }))
              }
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )
        },
        {
          label: t('debtPositionCreateWizard.wizardStepper.step3'),
          content: (
            <Step3
              data={{
                ...formData.step3,
                flagMandatoryDueDate:
                  formData.step1.debtPositionType.flagMandatoryDueDate
              }}
              setData={(data) => {
                setFormData((prev) => ({ ...prev, step3: data }));
              }}
              onNext={() => {
                setStep(3);
              }}
              onBack={() => setStep(1)}
              step1Data={formData.step1}
              step2Data={formData.step2}
            />
          )
        }
      ]}
      activeStep={step}
    />
  );
};

export default DebtPositionCreateWizard;
