import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import Step1GeneralConfiguration from './components/Step/Step1GeneralConfiguration';
import Step2AddDebtor from './components/Step/Step2AddDebtor';
import Step3 from './components/Step/Step3';
import { StepperContainer } from '../../components/Stepper';
import { PageRoutes } from '../../App';
import { PaymentOption } from '../../models/paymentTypes';
import { Step3Data, Step2Data, Step1Data } from '../../models/DebtPositionType';
import debtPositions from '../../api/debtPositions';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import utils from '../../utils';
import { DebtPositionDetailDTO } from '../../../generated/data-contracts';
import { SubjectType } from '../../utils/fieldValidation';

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
  const [formData, setFormData] = useState<FormData>(initialData);
  const [step, setStep] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  // Recuperare i dati dallo stato di navigazione
  const isEditing = location.state?.isEditing === true;
  const debtPositionId = location.state?.debtPositionId;

  // Utilizzare l'hook useQuery per caricare i dati se siamo in modalità modifica
  const { data: debtPositionDetail, error } =
    debtPositions.getDebtPositionDetail(organizationId, debtPositionId || 0);

  // Validazione e gestione errori
  useEffect(() => {
    if (isEditing && !debtPositionId) {
      console.error('Missing debtPositionId in edit mode');
      utils.notify.emit(t('debtPositionCreateWizard.errorMissingId'), 'error');
      navigate(PageRoutes.DEBT_POSITIONS_INDEX);
      return;
    }

    if (error) {
      console.error('Error loading debt position data:', error);
      utils.notify.emit(
        t('debtPositionCreateWizard.errorLoadingData'),
        'error'
      );
      navigate(PageRoutes.DEBT_POSITIONS_INDEX);
      return;
    }

    // Trasformare e impostare i dati quando sono disponibili
    if (isEditing && debtPositionDetail) {
      const transformedData = transformApiDataToFormData(debtPositionDetail);
      setFormData(transformedData);
    }
  }, [isEditing, debtPositionId, debtPositionDetail, error, navigate, t]);

  /**
   * Transform the API data to the format required by the form
   */
  const transformApiDataToFormData = (
    debtPositionDetail: DebtPositionDetailDTO
  ): FormData => {
    const step1: Step1Data = {
      debtPositionType: {
        value: '',
        readonly: isEditing,
        flagMandatoryDueDate: false
      },
      description: {
        value: debtPositionDetail.description || '',
        readonly: false
      }
    };

    const step2: Step2Data = {
      subjectType: {
        value:
          debtPositionDetail.debtor?.entityType === 'F'
            ? SubjectType.INDIVIDUAL
            : SubjectType.BUSINESS,
        readonly: isEditing
      },
      taxCode: {
        value: debtPositionDetail.debtor?.fiscalCode || '',
        readonly: isEditing
      },
      fullName: {
        value: debtPositionDetail.debtor?.fullName || '',
        readonly: isEditing
      },
      address: {
        value: debtPositionDetail.debtor?.address || '',
        readonly: isEditing
      },
      civicNumber: {
        value: debtPositionDetail.debtor?.civic || '',
        readonly: isEditing
      },
      zipCode: {
        value: debtPositionDetail.debtor?.postalCode || '',
        readonly: isEditing
      },
      country: {
        value: debtPositionDetail.debtor?.nation || 'IT',
        readonly: isEditing
      },
      province: {
        value: debtPositionDetail.debtor?.province || '',
        readonly: isEditing
      },
      city: {
        value: debtPositionDetail.debtor?.location || '',
        readonly: isEditing
      }
    };

    const firstPaymentOption = debtPositionDetail.paymentOptions?.[0];
    const step3: Step3Data = {
      paymentObject: {
        value: firstPaymentOption?.description || '',
        readonly: false
      },
      paymentOption: {
        value: (firstPaymentOption?.paymentOptionType === 'INSTALLMENTS'
          ? 'INSTALLMENTS'
          : 'SINGLE') as PaymentOption,
        readonly: false
      },
      amount: {
        value: firstPaymentOption?.totalAmountCents
          ? (firstPaymentOption.totalAmountCents / 100).toFixed(2)
          : '',
        readonly: false
      },
      dueDate: {
        value: firstPaymentOption?.installments?.[0]?.dueDate || '',
        readonly: false
      },
      isMultibeneficiary: {
        value: false, // TODO: determinare in base ai beneficiari
        readonly: false
      },
      flagMandatoryDueDate: false, // TODO: determinare in base al tipo
      beneficiaries: [], // TODO: mappare i beneficiari
      installments: [] // TODO: mappare le rate
    };

    return {
      step1,
      step2,
      step3
    };
  };

  return (
    <StepperContainer
      title={
        isEditing
          ? t('debtPositionCreateWizard.editTitle')
          : t('debtPositionCreateWizard.title')
      }
      description={
        isEditing
          ? t('debtPositionCreateWizard.editDescription')
          : t('debtPositionCreateWizard.description')
      }
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
              onBack={() => navigate(PageRoutes.DEBT_POSITIONS_INDEX)}
              isEditing={isEditing}
              debtPositionTypeOrgCode={
                debtPositionDetail?.debtPositionTypeOrgCode
              }
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
