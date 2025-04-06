import { useState } from 'react';
import { Grid } from '@mui/material';
import WizardStepper from './components/WizardStepper';
import Step1GeneralConfiguration from './components/Step1GeneralConfiguration';
import WizardStepWrapper from './components/WizardStepWrapper';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useTranslation } from 'react-i18next';

type FormData = {
  step1: {
    debtPositionType: {
      value: string;
      readonly: boolean;
    };
    description: {
      value: string;
      readonly: boolean;
    };
  };
};

type StepKey = keyof FormData;

type StepConfig<K extends StepKey = StepKey> = {
  key: K;
  Component: React.ComponentType<{
    data: FormData[K];
    setData: (data: FormData[K]) => void;
    onNext: () => void;
    onBack?: () => void;
  }>;
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
    }
    // step2: {
    //   codiceFiscale: '',
    //   nomeDebitore: ''
    // },
    // step3: {
    //   importo: '',
    //   scadenza: ''
    // }
  }); // dati del form in base allo step

  const allSteps: Array<StepConfig> = [
    {
      key: 'step1',
      Component: Step1GeneralConfiguration,
      title: t('debtPositionCreateWizard.generalConfiguration.title'),
      subtitle: t('debtPositionCreateWizard.generalConfiguration.subtitle')
    }
  ];

  const steps = allSteps.map(({ key, Component }, index) => (
    <Component
      key={`step-${key}`}
      data={formData[key]}
      setData={(data) => setFormData((prev) => ({ ...prev, [key]: data }))}
      onNext={() => setStep(index + 1)}
      // onBack={() => setStep(index - 1)}
    />
  ));

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
