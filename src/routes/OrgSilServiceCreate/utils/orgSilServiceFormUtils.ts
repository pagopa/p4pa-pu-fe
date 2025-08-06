import { OrgSilServiceFormData } from '../schema';
import {
  OrgSilServiceDecryptedDTO,
  JwtAlgorithm
} from '../../../../generated/data-contracts';

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

  if (formData.authConfigType === 'basic') {
    dto.legacyBasicAuthConfig = {
      authUrl: formData.basicAuthURL || undefined,
      user: formData.basicUser,
      psw: formData.basicPassword,
      authConfig: 'legacyBasic'
    };
  }

  if (formData.authConfigType === 'jwt') {
    dto.legacyJwtAuthConfig = {
      kid: formData.jwtKid || undefined,
      subject: formData.jwtSubject || undefined,
      issuer: formData.jwtIssuer || undefined,
      algorithm: (formData.jwtAlgorithm as JwtAlgorithm) || undefined,
      signingKey: formData.jwtSigningKey || undefined,
      authConfig: 'legacyJwt'
    };
  }

  return dto;
};
