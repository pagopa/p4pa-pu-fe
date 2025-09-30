import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, generatePath } from 'react-router';
import { StepperContainer } from '../../../components/Stepper';
import { PageRoutes } from '../../../routes';
import { useStore } from '../../../store/GlobalStore';
import { getOrganizationDetail } from '../../../api/organizations';
import { OrganizationDetailDTO } from '../../../../generated/data-contracts';
import { OrganizationEditFormData } from '../../../models/OrganizationEditTypes';

import Step1AnagraficaEnte from './components/Step/Step1AnagraficaEnte';
import utils from '../../../utils';

const initialData: OrganizationEditFormData = {
  step1: {
    orgName: {
      value: '',
      readonly: false
    },
    orgFiscalCode: {
      value: '',
      readonly: false
    },
    orgEmail: {
      value: '',
      readonly: false
    },
    orgLogo: {
      value: null,
      readonly: false
    }
  },
  step2: {}
};

const OrganizationEditWizard = () => {
  const [formData, setFormData] =
    useState<OrganizationEditFormData>(initialData);
  const [step, setStep] = useState(0);
  const hasSetupFormData = useRef(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { organizationId: organizationIdByURL } = useParams<{
    organizationId: string;
  }>();

  const {
    state: { organizationId }
  } = useStore();

  const getOrganizationId = !isNaN(Number(organizationIdByURL))
    ? Number(organizationIdByURL)
    : organizationId;

  const {
    isError,
    isSuccess,
    isLoading,
    data: organizationDetailData
  } = getOrganizationDetail(getOrganizationId);

  useEffect(() => {
    if (isError) {
      // Se c'è un errore nel caricamento, torna alla pagina di dettaglio
      utils.notify.emit(t('organizationEditWizard.errorLoadingData'), 'error');
      navigate(
        generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId: getOrganizationId
        })
      );
      return;
    }

    if (isSuccess && organizationDetailData) {
      // Fill form with existing organization data
      const transformedData = transformApiDataToFormData(
        organizationDetailData
      );
      setFormData(transformedData);
      hasSetupFormData.current = true;
    }
  }, [isError, isSuccess, organizationDetailData, navigate, getOrganizationId]);

  const transformApiDataToFormData = (
    orgData: OrganizationDetailDTO
  ): OrganizationEditFormData => {
    return {
      step1: {
        orgName: {
          value: orgData.orgName || '',
          readonly: !!orgData.orgName // If present, becomes readonly
        },
        orgFiscalCode: {
          value: orgData.orgFiscalCode || '',
          readonly: !!orgData.orgFiscalCode // If present, becomes readonly
        },
        orgEmail: {
          value: orgData.orgEmail || '',
          readonly: false // Email is always editable
        },
        orgLogo: {
          value: orgData.orgLogo || null,
          readonly: false // Logo is always editable
        }
      },
      step2: {}
    };
  };

  const handleGoBack = () => {
    navigate(
      generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
        organizationId: getOrganizationId
      })
    );
  };

  // Don't render anything until the data is ready
  if (isLoading || !hasSetupFormData.current) {
    return null;
  }

  return (
    <StepperContainer
      title={t('organizationEditWizard.title')}
      description={t('organizationEditWizard.description')}
      steps={[
        {
          label: t('organizationEditWizard.step1.label'),
          content: (
            <Step1AnagraficaEnte
              key="step1"
              data={formData.step1}
              setData={(data) => {
                setFormData((prev) => ({ ...prev, step1: data }));
              }}
              onNext={() => setStep(1)}
              onBack={handleGoBack}
            />
          )
        },
        {
          label: t('organizationEditWizard.step2.label'),
          content: (
            <div key="step2">
              {/* TODO: Implement Step2 in the future */}
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Step 2 - Organization configuration</h3>
                <p>This step will be implemented in the future</p>
                <button onClick={() => setStep(0)}>Back</button>
                <button onClick={handleGoBack}>Save and exit</button>
              </div>
            </div>
          )
        }
      ]}
      activeStep={step}
    />
  );
};

export default OrganizationEditWizard;
