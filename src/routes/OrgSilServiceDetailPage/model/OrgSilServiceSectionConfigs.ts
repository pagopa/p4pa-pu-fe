import { TFunction } from 'i18next';
import {
  OrgSilServiceDecryptedDTO,
  OrgSilServiceType
} from '../../../../generated/core/data-contracts';
import { DetailSectionProps } from '../../../components/DetailContainer/DetailContainer';

export const getOrgSilServiceSectionsConfig = (
  orgSilService: OrgSilServiceDecryptedDTO,
  t: TFunction
): DetailSectionProps['sections'] => {
  const generalConfigSection = {
    title: {
      label: t('orgSilServiceDetail.sections.generalConfig.title'),
      variant: 'h6' as const,
      sx: { fontWeight: 'bold', mb: 2 }
    },
    data: [
      {
        label: t('orgSilServiceDetail.fields.applicationName'),
        value: orgSilService.applicationName
      },
      {
        label: t('orgSilServiceDetail.fields.serviceUrl'),
        value: orgSilService.serviceUrl
      },
      {
        label: t('orgSilServiceDetail.fields.serviceType'),
        value: getServiceTypeDisplayName(orgSilService.serviceType, t)
      }
    ],
    inline: true,
    divider: false
  };

  const sections = [generalConfigSection];

  if (orgSilService.flagLegacy) {
    const authConfigSection = {
      title: {
        label: t('orgSilServiceDetail.sections.authConfig.title'),
        variant: 'h6' as const,
        sx: { fontWeight: 'bold', mb: 2, mt: 3 }
      },
      data: buildAuthConfigData(orgSilService, t),
      inline: true,
      divider: false
    };
    sections.push(authConfigSection);
  }

  return sections;
};

const getServiceTypeDisplayName = (
  serviceType: OrgSilServiceType,
  t: TFunction
): string => {
  const typeMap = {
    [OrgSilServiceType.PAID_NOTIFICATION_OUTCOME]: t(
      'orgSilServiceDetail.serviceTypes.paymentNotification'
    ),
    [OrgSilServiceType.ACTUALIZATION]: t(
      'orgSilServiceDetail.serviceTypes.amountActualization'
    )
  };

  return typeMap[serviceType] || serviceType;
};

const buildAuthConfigData = (
  orgSilService: OrgSilServiceDecryptedDTO,
  t: TFunction
) => {
  const data = [];

  data.push({
    label: t('orgSilServiceDetail.fields.apiLegacy'),
    value: t('commons.yes')
  });

  if (orgSilService.legacyBasicAuthConfig) {
    const config = orgSilService.legacyBasicAuthConfig;

    data.push(
      {
        label: t('orgSilServiceDetail.fields.authConfig'),
        value: t('orgSilServiceDetail.authTypes.basicAuth')
      },
      {
        label: t('orgSilServiceDetail.fields.authUrl'),
        value: config.authUrl || '-'
      },
      {
        label: t('orgSilServiceDetail.fields.username'),
        value: config.user || '-'
      },
      {
        label: t('orgSilServiceDetail.fields.password'),
        value: config.psw || '-'
      }
    );
  }

  if (orgSilService.legacyJwtAuthConfig) {
    const config = orgSilService.legacyJwtAuthConfig;

    data.push(
      {
        label: t('orgSilServiceDetail.fields.authConfig'),
        value: t('orgSilServiceDetail.authTypes.jwtAuth')
      },
      {
        label: t('orgSilServiceDetail.fields.kid'),
        value: config.kid || '-'
      },
      {
        label: t('orgSilServiceDetail.fields.issuer'),
        value: config.issuer || '-'
      },
      {
        label: t('orgSilServiceDetail.fields.subject'),
        value: config.subject || '-'
      },
      {
        label: t('orgSilServiceDetail.fields.algorithm'),
        value: config.algorithm || '-'
      },
      {
        label: t('orgSilServiceDetail.fields.signingKey'),
        value: config.signingKey || '-'
      }
    );
  }

  return data;
};
