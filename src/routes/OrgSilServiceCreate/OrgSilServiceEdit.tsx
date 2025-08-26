import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { useOrgSilServiceForm } from './hooks/useOrgSilServiceForm';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PageRoutes } from '..';
import { OrgSilServiceForm } from './components/OrgSilServiceForm';
import { OrgSilServiceFormData } from './schema';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { orgSilServiceDecryptedDTOSchema } from '../../../generated/zod-schema';
import { OrgSilServiceDecryptedDTO } from '../../../generated/data-contracts';
import { useEffect } from 'react';

export const OrgSilServiceEdit = () => {
  const { orgSilServiceId } = useParams<{ orgSilServiceId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { updateService } = useOrgSilServiceForm({
    organizationId
  });

  const {
    data: serviceData,
    error,
    refetch
  } = useQuery({
    queryKey: ['orgSilServiceDetail', organizationId, orgSilServiceId],
    queryFn: async () => {
      if (!orgSilServiceId) {
        throw new Error('Service ID not provided');
      }

      const { data } = await utils.apiClient.bff.getOrgSilServiceDetails(
        organizationId,
        Number(orgSilServiceId)
      );

      parseAndLog(orgSilServiceDecryptedDTOSchema, data);
      return data;
    },
    enabled: !!orgSilServiceId && !!organizationId
  });

  useEffect(() => {
    if (orgSilServiceId && organizationId) {
      refetch();
    }
  }, [orgSilServiceId, organizationId, refetch]);

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
    if (!serviceData?.orgSilServiceId) {
      return;
    }

    const updateData = {
      ...formData,
      orgSilServiceId: serviceData.orgSilServiceId,
      organizationId
    };
    updateService(updateData);
  };

  const handleCancel = () => {
    navigate(PageRoutes.ORG_SIL_SERVICE);
  };

  if (error) {
    return (
      <Box p={3}>
        <div>{t('commons.errorLoadingData')}</div>
      </Box>
    );
  }

  if (!serviceData) {
    return (
      <Box p={3}>
        <div>{t('commons.dataNotFound')}</div>
      </Box>
    );
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
      initialData={transformToFormData(serviceData)}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
