import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useOrgSilServiceForm } from './hooks/useOrgSilServiceForm';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PageRoutes } from '..';
import { OrgSilServiceForm } from './components/OrgSilServiceForm';
import { OrgSilServiceFormData } from './schema';
import orgSilServiceApi from '../../api/orgSilService';
import { OrgSilServiceDecryptedDTO } from '../../../generated/data-contracts';
import { useEffect, useRef } from 'react';

export const OrgSilServiceEdit = () => {
  const { orgSilServiceId } = useParams<{ orgSilServiceId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  // Prevent flash render during navigation after successful update
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (!orgSilServiceId || !organizationId) {
      navigate(PageRoutes.RESPONSES_ERROR, {
        replace: true,
        state: { errorType: 'invalidParameters' }
      });
    }
  }, [orgSilServiceId, organizationId, navigate]);

  const { updateService } = useOrgSilServiceForm({
    organizationId
  });

  const {
    data: serviceData,
    error,
    isPending,
    isFetching
  } = orgSilServiceApi.getOrgSilServiceById({
    organizationId,
    orgSilServiceId: Number(orgSilServiceId)
  });

  const transformToFormData = (
    data: OrgSilServiceDecryptedDTO
  ): Partial<OrgSilServiceFormData> => {
    const formData: Partial<OrgSilServiceFormData> = {
      applicationName: data.applicationName,
      serviceUrl: data.serviceUrl,
      serviceType: data.serviceType,
      flagLegacy: data.flagLegacy
    };

    if (data.legacyBasicAuthConfig) {
      formData.authConfigType = 'basic';
      formData.basicUser = data.legacyBasicAuthConfig.user;
      formData.basicPassword = data.legacyBasicAuthConfig.psw;
      formData.basicAuthURL = data.legacyBasicAuthConfig.authUrl;
    }

    if (data.legacyJwtAuthConfig) {
      formData.authConfigType = 'jwt';
      formData.jwtKid = data.legacyJwtAuthConfig.kid;
      formData.jwtIssuer = data.legacyJwtAuthConfig.issuer;
      formData.jwtSubject = data.legacyJwtAuthConfig.subject;
      formData.jwtAlgorithm = data.legacyJwtAuthConfig.algorithm;
      formData.jwtSigningKey = data.legacyJwtAuthConfig.signingKey;
    }

    return formData;
  };

  const handleSubmit = (formData: OrgSilServiceFormData) => {
    if (!serviceData?.response?.orgSilServiceId) {
      return;
    }

    isNavigatingRef.current = true;

    const updateData = {
      ...formData,
      orgSilServiceId: serviceData.response.orgSilServiceId,
      organizationId
    };
    updateService(updateData).catch(() => {
      isNavigatingRef.current = false;
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (error) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  if (isPending || isFetching || !serviceData?.response) {
    return null;
  }

  if (isNavigatingRef.current) {
    return null;
  }

  const config = {
    title: t('orgSilServiceEdit.title'),
    description: t('orgSilServiceEdit.description'),
    submitButtonLabel: t('commons.save'),
    serviceTypeDisabled: true
  };

  return (
    <OrgSilServiceForm
      config={config}
      initialData={transformToFormData(serviceData.response)}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
