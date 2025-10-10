import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, generatePath } from 'react-router';
import { StepperContainer } from '../../../components/Stepper';
import { PageRoutes } from '../../../routes';
import { useStore } from '../../../store/GlobalStore';
import {
  getOrganizationDetail,
  updateOrganization
} from '../../../api/organizations';
import { OrganizationDetailDTO } from '../../../../generated/data-contracts';
import {
  OrganizationEditFormData,
  LANGUAGE_OPTIONS
} from '../../../models/OrganizationEditTypes';

import Step1AnagraficaEnte from './components/Step/Step1EntityProfile';
import Step2ConfigurazioneEnte from './components/Step/Step2EntityConfiguration';
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
    },
    logoRemoved: false,
    organizationStatus: undefined
  },
  step2: {
    // Accounting Information
    iban: {
      value: '',
      readonly: false
    },
    ibanPostal: {
      value: '',
      readonly: false
    },
    cbill: {
      value: '',
      readonly: false
    },
    flagTreasury: {
      value: false,
      readonly: false
    },
    // Payments Information
    segregationCode: {
      value: '',
      readonly: false
    },
    generateNoticeApiKey: {
      value: '',
      readonly: false
    },
    additionalLanguage: {
      value: false,
      readonly: false
    },
    selectedLanguage: {
      value: '',
      readonly: false
    },
    flagNotifyOutcomePush: {
      value: null,
      readonly: false
    },
    flagPaymentNotification: {
      value: null,
      readonly: false
    },
    // PagoPA Products Integration
    flagNotifyIo: {
      value: false,
      readonly: false
    },
    ioApiKey: {
      value: '',
      readonly: false
    },
    pdndEnabled: {
      value: false,
      readonly: false
    },
    sendApiKey: {
      value: '',
      readonly: false
    },
    organizationStatus: undefined
  }
};

const OrganizationEditWizard = () => {
  const [formData, setFormData] =
    useState<OrganizationEditFormData>(initialData);
  const [step, setStep] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);
  const organizationDetailDataRef = useRef<OrganizationDetailDTO | null>(null);
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

  const update = updateOrganization();

  useEffect(() => {
    if (isError) {
      // If there is an error loading, go back to the detail page
      utils.notify.emit(t('organizationEditWizard.errorLoadingData'), 'error');
      navigate(
        generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId: getOrganizationId
        })
      );
      return;
    }

    if (isSuccess && organizationDetailData && !isDataReady) {
      // Fill form with existing organization data
      const transformedData = transformApiDataToFormData(
        organizationDetailData
      );
      setFormData(transformedData);
      // Store original data for PUT request
      organizationDetailDataRef.current = organizationDetailData;
      setIsDataReady(true);
    }
  }, [
    isError,
    isSuccess,
    organizationDetailData,
    navigate,
    getOrganizationId,
    isDataReady,
    t
  ]);

  const transformApiDataToFormData = (
    orgData: OrganizationDetailDTO
  ): OrganizationEditFormData => {
    // Validate and sanitize additionalLanguage from API
    const validLanguages = Object.values(LANGUAGE_OPTIONS);
    const normalizedLanguage = orgData.additionalLanguage?.toLowerCase() || '';
    const isValidLanguage = validLanguages.includes(
      normalizedLanguage as (typeof validLanguages)[number]
    );

    return {
      step1: {
        orgName: {
          value: orgData.orgName || '',
          readonly: true
        },
        orgFiscalCode: {
          value: orgData.orgFiscalCode || '',
          readonly: true
        },
        orgEmail: {
          value: orgData.orgEmail || '',
          readonly: false
        },
        orgLogo: {
          value: orgData.orgLogo || null,
          readonly: false
        },
        logoRemoved: false,
        organizationStatus: orgData.status
      },
      step2: {
        // Accounting Information
        iban: {
          value: orgData.iban || '',
          readonly: false
        },
        ibanPostal: {
          value: orgData.postalIban || '',
          readonly: false
        },
        cbill: {
          value: orgData.cbillInterBankCode || '',
          readonly: false
        },
        flagTreasury: {
          value: orgData.flagTreasury ?? false,
          readonly: false
        },
        // Payments Information
        segregationCode: {
          value: orgData.segregationCode || '',
          readonly: false
        },
        generateNoticeApiKey: {
          value: orgData.generateNoticeApiKey || '',
          readonly: false
        },
        additionalLanguage: {
          value: isValidLanguage,
          readonly: false
        },
        selectedLanguage: {
          value: isValidLanguage ? normalizedLanguage : '',
          readonly: false
        },
        flagNotifyOutcomePush: {
          value: orgData.flagNotifyOutcomePush ?? null,
          readonly: false
        },
        flagPaymentNotification: {
          value: orgData.flagPaymentNotification ?? null,
          readonly: false
        },
        // PagoPA Products Integration
        flagNotifyIo: {
          value: orgData.flagNotifyIo ?? false,
          readonly: false
        },
        ioApiKey: {
          value: orgData.ioApiKey || '',
          readonly: false
        },
        pdndEnabled: {
          value: orgData.pdndEnabled ?? false,
          readonly: false
        },
        sendApiKey: {
          value: orgData.sendApiKey || '',
          readonly: false
        },
        organizationStatus: orgData.status
      }
    };
  };

  // Transform form data to API payload format
  const transformFormDataToApiPayload = (
    formData: OrganizationEditFormData,
    originalData: OrganizationDetailDTO
  ): OrganizationDetailDTO => {
    // Determine orgLogo value based on user actions
    let orgLogoValue: string | undefined;
    if (formData.step1.logoRemoved) {
      // User explicitly removed the logo, send undefined to remove it
      orgLogoValue = undefined;
    } else if (formData.step1.orgLogo.value) {
      // User uploaded a new logo or kept existing one
      orgLogoValue = formData.step1.orgLogo.value;
    } else {
      // No logo action taken, keep original
      orgLogoValue = originalData.orgLogo;
    }

    const payload = {
      // Fields from original API (readonly)
      organizationId: originalData.organizationId,
      flagTreasury: formData.step2.flagTreasury.value,
      externalOrganizationId: originalData.externalOrganizationId,
      ipaCode: originalData.ipaCode,
      orgTypeCode: originalData.orgTypeCode,
      status: originalData.status,
      startDate: originalData.startDate,
      brokerId: originalData.brokerId,
      password: originalData.password,
      // Step1 editable fields
      orgFiscalCode: formData.step1.orgFiscalCode.value,
      orgName: formData.step1.orgName.value,
      orgEmail: formData.step1.orgEmail.value,
      orgLogo: orgLogoValue,
      // Step2 accounting fields
      iban: formData.step2.iban.value,
      postalIban: formData.step2.ibanPostal.value,
      cbillInterBankCode: formData.step2.cbill.value,
      // Step2 payment fields
      segregationCode: formData.step2.segregationCode.value,
      generateNoticeApiKey: formData.step2.generateNoticeApiKey.value,
      additionalLanguage: formData.step2.additionalLanguage.value
        ? formData.step2.selectedLanguage.value.toUpperCase()
        : '',
      flagNotifyOutcomePush:
        formData.step2.flagNotifyOutcomePush.value ?? false,
      flagPaymentNotification:
        formData.step2.flagPaymentNotification.value ?? false,
      // Step2 PagoPA integration fields
      flagNotifyIo: formData.step2.flagNotifyIo.value,
      ioApiKey: formData.step2.ioApiKey.value,
      pdndEnabled: formData.step2.pdndEnabled.value,
      sendApiKey: formData.step2.sendApiKey.value
    };

    return payload;
  };

  // Submit handler for final step
  const handleFinalSubmit = async (
    step2Values?: OrganizationEditFormData['step2']
  ) => {
    if (!organizationDetailDataRef.current) {
      console.error('Original organization data not available');
      navigate(PageRoutes.RESPONSES_ERROR);
      return;
    }

    try {
      // Use the passed values or the current formData state
      const dataToUse: OrganizationEditFormData = step2Values
        ? { ...formData, step2: step2Values }
        : formData;

      const payload = transformFormDataToApiPayload(
        dataToUse,
        organizationDetailDataRef.current
      );

      await update.mutateAsync({
        organizationId: getOrganizationId,
        organizationData: payload
      });

      utils.notify.emit(t('organizationEditWizard.successMessage'), 'success');

      navigate(
        generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId: getOrganizationId
        })
      );
    } catch (error) {
      console.error(error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  };

  const handleGoBack = () => {
    navigate(
      generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
        organizationId: getOrganizationId
      })
    );
  };

  // Don't render anything until the data is ready
  if (isLoading || !isDataReady) {
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
            <Step2ConfigurazioneEnte
              key="step2"
              data={formData.step2}
              setData={(data) => {
                setFormData((prev) => ({ ...prev, step2: data }));
              }}
              onNext={handleFinalSubmit}
              onBack={() => setStep(0)}
            />
          )
        }
      ]}
      activeStep={step}
    />
  );
};

export default OrganizationEditWizard;
