import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Step1GeneralConfiguration, {
  Step1Data
} from './components/Step/Step1GeneralConfiguration';
import Step2AddDebtor, { Step2Data } from './components/Step/Step2AddDebtor';
import Step3, { Step3Data } from './components/Step/Step3';
import { StepperContainer } from '../../components/Stepper';
import { Stepper } from '../../components/Stepper/types';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../App';
import { Installment } from '../../models/paymentTypes';

// Estende il tipo Installment per includere la proprietà 'sameBeneficiariesAsBefore'
type ExtendedInstallment = Installment & {
  sameBeneficiariesAsBefore?: boolean;
};

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
      value: '' as any, // Correzione per l'errore del linter
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
    beneficiaries: [] // Inizializzato come array vuoto
  }
};

const DebtPositionCreateWizard = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialData);

  // Aggiungiamo un useEffect per monitorare i cambiamenti nelle installments
  useEffect(() => {
    if (formData.step3.installments) {
      console.log('Installments aggiornate:', formData.step3.installments);

      // Verifica se ci sono installments con beneficiari copiati
      const installmentsWithCopiedBeneficiaries =
        formData.step3.installments.filter(
          (inst, idx) =>
            idx > 0 &&
            inst.isMultibeneficiary &&
            (inst as ExtendedInstallment).sameBeneficiariesAsBefore === true
        );

      if (installmentsWithCopiedBeneficiaries.length > 0) {
        console.log(
          'Installments con beneficiari copiati:',
          installmentsWithCopiedBeneficiaries
        );

        // Per ogni installment con beneficiari copiati, verifichiamo che i beneficiari siano effettivamente gli stessi della rata precedente
        installmentsWithCopiedBeneficiaries.forEach((inst) => {
          const currentIndex =
            formData.step3.installments?.findIndex((i) => i === inst) || 0;
          if (currentIndex > 0 && formData.step3.installments) {
            const previousInstallment =
              formData.step3.installments[currentIndex - 1];
            const currentBeneficiaries = inst.beneficiaries || [];
            const previousBeneficiaries =
              previousInstallment.beneficiaries || [];

            console.log(`Confronto beneficiari - Rata ${currentIndex}:`, {
              beneficiariPrecedenti: previousBeneficiaries,
              beneficiariAttuali: currentBeneficiaries,
              sonoDaConsiderareUguali: (inst as ExtendedInstallment)
                .sameBeneficiariesAsBefore,
              sonoEffettivamenteUguali:
                JSON.stringify(previousBeneficiaries) ===
                JSON.stringify(currentBeneficiaries)
            });
          }
        });
      }
    }
  }, [formData.step3.installments]);

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
              setData={(data) =>
                setFormData((prev) => ({ ...prev, step1: data }))
              }
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
              setData={(data) =>
                setFormData((prev) => ({ ...prev, step3: data }))
              }
              onNext={() => {
                console.log(
                  'Dati completi del form al completamento:',
                  formData
                );
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )
        }
      ]}
      activeStep={step}
    />
  );
};

export default DebtPositionCreateWizard;
