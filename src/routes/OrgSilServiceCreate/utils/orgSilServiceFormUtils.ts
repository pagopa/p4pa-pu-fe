import { OrgSilServiceFormData } from '../schema';
import {
  OrgSilServiceDecryptedDTO,
  JwtAlgorithm,
  SilServiceLegacyBasicAuthConfigDTO,
  SilServiceLegacyJwtAuthConfigDTO,
  OrgSilServiceType
} from '../../../../generated/core/data-contracts';
import { toCamelCase } from '../../../utils/formatters';
import i18n from '../../../translations/i18n';
import { t } from 'i18next';

export const SERVICE_TYPE_OPTIONS = Object.values(OrgSilServiceType).map(
  (type) => ({
    value: type,
    label: t(`orgSilServiceCreate.${toCamelCase(type)}`)
  })
);

export const JWT_ALGORITHM_OPTIONS = Object.values(JwtAlgorithm).map(
  (algo) => ({ value: algo, label: algo })
);

export const AUTH_CONFIG_OPTIONS = [
  { value: 'basic' as const, label: i18n.t('orgSilServiceCreate.legacyBasic') },
  { value: 'jwt' as const, label: i18n.t('orgSilServiceCreate.legacyJWT') }
] as const;

export const LEGACY_OPTIONS = [
  { value: 'true' as const, label: 'commons.yes' },
  { value: 'false' as const, label: 'commons.no' }
] as const;

export type AuthConfigType = (typeof AUTH_CONFIG_OPTIONS)[number]['value'];
export type LegacyOptionValue = (typeof LEGACY_OPTIONS)[number]['value'];

export const BASIC_AUTH_FIELDS = [
  'basicUser',
  'basicPassword',
  'basicAuthURL'
] as const;

export const JWT_AUTH_FIELDS = [
  'jwtKid',
  'jwtIssuer',
  'jwtSubject',
  'jwtAlgorithm',
  'jwtSigningKey'
] as const;

export const ALL_AUTH_FIELDS = [
  ...BASIC_AUTH_FIELDS,
  ...JWT_AUTH_FIELDS,
  'authConfigType'
] as const;

export type AuthFieldName = (typeof ALL_AUTH_FIELDS)[number];
export type BasicAuthFieldName = (typeof BASIC_AUTH_FIELDS)[number];
export type JwtAuthFieldName = (typeof JWT_AUTH_FIELDS)[number];

export const API_CONSTRAINTS = {
  APPLICATION_NAME: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 255
  },
  SERVICE_URL: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 500
  }
} as const;

export const transformFormDataToDTO = (
  formData: OrgSilServiceFormData,
  organizationId: number
): OrgSilServiceDecryptedDTO => {
  const dto: OrgSilServiceDecryptedDTO = {
    organizationId,
    applicationName: formData.applicationName,
    serviceUrl: formData.serviceUrl,
    serviceType: formData.serviceType,
    flagLegacy: formData.flagLegacy
  };

  if (!formData.flagLegacy) {
    return dto;
  }

  if (formData.flagLegacy && formData.authConfigType) {
    switch (formData.authConfigType) {
      case 'basic':
        dto.legacyBasicAuthConfig = createBasicAuthConfig(formData);
        break;
      case 'jwt':
        dto.legacyJwtAuthConfig = createJwtAuthConfig(formData);
        break;
    }
  }

  return dto;
};

const createBasicAuthConfig = (
  formData: OrgSilServiceFormData
): SilServiceLegacyBasicAuthConfigDTO => ({
  authUrl: formData.basicAuthURL || '',
  user: formData.basicUser || '',
  psw: formData.basicPassword || '',
  authConfig: 'legacyBasic'
});

const createJwtAuthConfig = (
  formData: OrgSilServiceFormData
): SilServiceLegacyJwtAuthConfigDTO => ({
  kid: formData.jwtKid || '',
  subject: formData.jwtSubject || '',
  issuer: formData.jwtIssuer || '',
  algorithm: formData.jwtAlgorithm || JwtAlgorithm.HS256,
  signingKey: formData.jwtSigningKey || '',
  authConfig: 'legacyJwt'
});

export const validateFormData = (formData: OrgSilServiceFormData): boolean => {
  if (
    !formData.applicationName ||
    !formData.serviceUrl ||
    !formData.serviceType
  ) {
    return false;
  }

  if (!formData.flagLegacy) {
    return true;
  }

  if (formData.flagLegacy) {
    return validateLegacyConfig(formData);
  }

  return false;
};

const validateLegacyConfig = (formData: OrgSilServiceFormData): boolean => {
  if (!formData.authConfigType) {
    return false;
  }

  switch (formData.authConfigType) {
    case 'basic':
      return !!(
        formData.basicUser &&
        formData.basicPassword &&
        formData.basicAuthURL
      );
    case 'jwt':
      return !!(
        formData.jwtKid &&
        formData.jwtIssuer &&
        formData.jwtSubject &&
        formData.jwtAlgorithm &&
        formData.jwtSigningKey
      );
    default:
      return false;
  }
};
