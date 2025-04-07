import { useState } from 'react';
import { Grid } from '@mui/material';
import WizardStepper from '../../components/Wizard/WizardStepper';
import Step1GeneralConfiguration from './components/Step1GeneralConfiguration';
import WizardStepWrapper from '../../components/Wizard/WizardStepWrapper';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useTranslation } from 'react-i18next';
import Step2AddDebtor from './components/Step2AddDebtor';

type Step1Data = {
  debtPositionType: {
    value: string;
    readonly: boolean;
  };
  description: {
    value: string;
    readonly: boolean;
  };
};

type Step2Data = {
  subjectType: {
    value: string;
    readonly: boolean;
  };
  taxCode: {
    value: string;
    readonly: boolean;
  };
  fullName: {
    value: string;
    readonly: boolean;
  };
  address: {
    value: string;
    readonly: boolean;
  };
  civicNumber: {
    value: string;
    readonly: boolean;
  };
  zipCode: {
    value: string;
    readonly: boolean;
  };
  country: {
    value: string;
    readonly: boolean;
  };
  province: {
    value: string;
    readonly: boolean;
  };
  city: {
    value: string;
    readonly: boolean;
  };
};

type FormData = {
  step1: Step1Data;
  step2: Step2Data;
};

// Definizione di tipi specifici per i componenti
type Step1ComponentProps = {
  data: Step1Data;
  setData: (data: Step1Data) => void;
  onNext: () => void;
  onBack?: () => void;
};

type Step2ComponentProps = {
  data: Step2Data;
  setData: (data: Step2Data) => void;
  onNext: () => void;
  onBack?: () => void;
};

// Definizione di tipi specifici per i componenti
type Step1Config = {
  key: 'step1';
  Component: React.ComponentType<Step1ComponentProps>;
  title: string;
  subtitle: string;
};

type Step2Config = {
  key: 'step2';
  Component: React.ComponentType<Step2ComponentProps>;
  title: string;
  subtitle: string;
};

const DebtPositionCreateWizard = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // numero di step attivo
  const [formData, setFormData] = useState<FormData>({
    step1: {
      debtPositionType: {
        value: '',
        readonly: false
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
    }
  });
  // dati del form in base allo step

  console.log('formData', formData);

  const allSteps: [Step1Config, Step2Config] = [
    {
      key: 'step1',
      Component:
        Step1GeneralConfiguration as React.ComponentType<Step1ComponentProps>,
      title: t('debtPositionCreateWizard.generalConfiguration.title'),
      subtitle: t('debtPositionCreateWizard.generalConfiguration.subtitle')
    },
    {
      key: 'step2',
      Component: Step2AddDebtor as React.ComponentType<Step2ComponentProps>,
      title: t('debtPositionCreateWizard.addDebtor.title'),
      subtitle: t('debtPositionCreateWizard.addDebtor.subtitle')
    }
  ];

  const steps = allSteps.map(({ key, Component }, index) => {
    if (key === 'step1') {
      return (
        <Component
          key={`step-${key}`}
          data={formData.step1}
          setData={(data) => setFormData((prev) => ({ ...prev, step1: data }))}
          onNext={() => setStep(index + 1)}
        />
      );
    } else {
      return (
        <Component
          key={`step-${key}`}
          data={formData.step2}
          setData={(data) => setFormData((prev) => ({ ...prev, step2: data }))}
          onNext={() => setStep(index + 1)}
          onBack={() => setStep(index - 1)}
        />
      );
    }
  });

  return (
    <>
      <Grid container direction="column" alignItems="center" marginTop={2}>
        <Grid
          container
          direction="column"
          alignItems="left"
          marginTop={2}
          ml={1}
          mb={4}
        >
          <Grid item lg={12} mb={6} mt={2}>
            <Grid item lg={12} mb={6}>
              <TitleComponent
                title={t('debtPositionCreateWizard.title')}
                description={t('debtPositionCreateWizard.description')}
              />
            </Grid>
            <WizardStepper activeStep={step} />
          </Grid>
          <WizardStepWrapper
            title={allSteps[step].title}
            subtitle={allSteps[step].subtitle}
          >
            {steps[step]}
          </WizardStepWrapper>
        </Grid>
      </Grid>
    </>
  );
};

export default DebtPositionCreateWizard;
