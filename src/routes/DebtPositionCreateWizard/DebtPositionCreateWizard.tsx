import { useState } from 'react';
import { Grid } from '@mui/material';
import WizardStepper from './components/WizardStepper';
import Step1GeneralConfiguration from './components/Step1GeneralConfiguration';
import WizardStepWrapper from './components/WizardStepWrapper';
import TitleComponent from '../../components/TitleComponent/TitleComponent';

const DebtPositionCreateWizard = () => {
  const [step, setStep] = useState(0); // numero di step attivo
  const [formData, setFormData] = useState({
    step1: {
      tipoDovuto: {
        value: '',
        readonly: false
      },
      descrizione: {
        value: '',
        readonly: false
      }
    },
    step2: {
      codiceFiscale: '',
      nomeDebitore: ''
    },
    step3: {
      importo: '',
      scadenza: ''
    }
  }); // dati del form in base allo step

  const steps = [
    <Step1GeneralConfiguration
      data={formData.step1}
      setData={(step1) => setFormData((prev) => ({ ...prev, step1 }))}
      onNext={() => setStep(step + 1)}
    />
    // <Step2AddDebtor
    //   data={formData.step2}
    //   setData={(step2) => setFormData(prev => ({ ...prev, step2 }))}
    //   ...
    // />,
    // <Step3NoticeConfiguration
    //   data={formData.step3}
    //   setData={(step3) => setFormData(prev => ({ ...prev, step3 }))}
    //   ...
    // />
  ];

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
                title={'Crea una nuova Posizione Debitoria'}
                description={'Compila i campi e crea una Posizione Debitoria'}
              />
            </Grid>
            <WizardStepper activeStep={0} />
          </Grid>
          <WizardStepWrapper
            title="Configurazione generale"
            subtitle="Scegli tipo di dovuto su cui creare il nuovo dovuto e assegnarle un nome per il successivo tracciamento."
          >
            {steps[step]}
          </WizardStepWrapper>
        </Grid>
      </Grid>
    </>
  );
};

export default DebtPositionCreateWizard;
