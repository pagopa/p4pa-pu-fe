import { Stepper, Step, StepLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

const WizardStepper = ({ activeStep }: { activeStep: number }) => {
  const { t } = useTranslation();
  const labels = [
    t('debtPositionCreateWizard.wizardStepper.step1'),
    t('debtPositionCreateWizard.wizardStepper.step2'),
    t('debtPositionCreateWizard.wizardStepper.step3')
  ];

  return (
    <Stepper alternativeLabel activeStep={activeStep} sx={{ my: 3 }}>
      {labels.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default WizardStepper;
