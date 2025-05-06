import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import { useNavigate, useParams } from 'react-router';
import { PageRoutes } from '../../App';
import { useSignal } from '@preact/signals-react';
import { patchDebtPositionType } from '../../api/debtPositionsTypes';
import { DebtPositionTypeRequestBody } from '../../../generated/data-contracts';
import { Step1Configuration } from '../DebtTypeCreate/components/Step1Configuration';
import {
  Step2Data,
  Step2Settings
} from '../DebtTypeCreate/components/Step2Settings';
import { useStore } from '../../store/GlobalStore';
import { getDebtPositionTypeDetail } from '../../api/debtPositionTypeDetail';
import { STATE } from '../../store/types';

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

export const DebtTypeCatalogEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useStore();
  const { debtPositionTypeId } = useParams<{ debtPositionTypeId: string }>();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const { data } = getDebtPositionTypeDetail({
    organizationId,
    debtPositionTypeId: Number(debtPositionTypeId)
  });
  const [step, setStep] = useState(0);
  const formData = useSignal<DebtPositionTypeRequestBody>(initialData);
  const debtTypeEdit = patchDebtPositionType(Number(debtPositionTypeId));

  const submit = () => {
    debtTypeEdit.mutate(formData.value, {
      onSuccess: (formData) => {
        navigate(PageRoutes.DEBT_TYPE_CATALOG_EDIT_SUCCESS, {
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
      label: t('debtTypeCreate.stepper.step1'),
      content: (
        <Step1Configuration
          key="step1"
          onNext={() => setStep(1)}
          onBack={() => navigate(PageRoutes.DEBT_TYPES_CATALOG)}
          editmode={true}
          prefilledData={data}
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
          editmode={true}
          prefilledData={data}
        />
      )
    }
  ];

  return (

    <StepperContainer
      title={t('debtTypeCatalogEdit.title')}
      description={t('debtTypeCatalogEdit.description')}
      steps={steps}
      activeStep={step}
    />

  );
};
