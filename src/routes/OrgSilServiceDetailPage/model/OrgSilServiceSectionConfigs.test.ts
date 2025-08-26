import { describe, it, expect, beforeEach } from 'vitest';
import { useTranslation } from 'react-i18next';
import { renderHook } from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { getOrgSilServiceSectionsConfig } from './OrgSilServiceSectionConfigs';
import {
  JwtAlgorithm,
  OrgSilServiceDecryptedDTO,
  OrgSilServiceType
} from '../../../../generated/data-contracts';

const translations = {
  'orgSilServiceDetail.sections.generalConfig.title': 'Configurazione Generale',
  'orgSilServiceDetail.sections.authConfig.title':
    'Configurazione Autenticazione',
  'orgSilServiceDetail.fields.applicationName': 'Nome Applicazione',
  'orgSilServiceDetail.fields.serviceUrl': 'URL Servizio',
  'orgSilServiceDetail.fields.serviceType': 'Tipo Servizio',
  'orgSilServiceDetail.fields.apiLegacy': 'API Legacy',
  'orgSilServiceDetail.fields.authConfig': 'Tipo Autenticazione',
  'orgSilServiceDetail.fields.authUrl': 'URL Auth',
  'orgSilServiceDetail.fields.username': 'Username',
  'orgSilServiceDetail.fields.kid': 'Key ID',
  'orgSilServiceDetail.fields.issuer': 'Issuer',
  'orgSilServiceDetail.fields.subject': 'Subject',
  'orgSilServiceDetail.fields.algorithm': 'Algoritmo',
  'orgSilServiceDetail.fields.signingKey': 'Chiave Firma',
  'orgSilServiceDetail.serviceTypes.paymentNotification': 'Notifica Pagamento',
  'orgSilServiceDetail.serviceTypes.amountActualization':
    'Attualizzazione Importo',
  'orgSilServiceDetail.authTypes.basicAuth': 'Autenticazione Basic',
  'orgSilServiceDetail.authTypes.jwtAuth': 'Autenticazione JWT',
  'commons.yes': 'Sì'
};

const createBaseOrgSilService = (): OrgSilServiceDecryptedDTO => ({
  orgSilServiceId: 1,
  applicationName: 'Test Application',
  serviceUrl: 'https://api.test.com/webhook',
  serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
  organizationId: 123,
  flagLegacy: false
});

describe('OrgSilServiceSectionConfigs', () => {
  beforeEach(() => {
    i18nTestSetup(translations);
  });

  const useTestTranslation = () => {
    const { result } = renderHook(() => useTranslation());
    return result.current.t;
  };

  describe('getOrgSilServiceSectionsConfig', () => {
    it('should return only general config section for non-legacy service', () => {
      const t = useTestTranslation();
      const orgSilService = createBaseOrgSilService();

      const result = getOrgSilServiceSectionsConfig(orgSilService, t);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: {
          label: 'Configurazione Generale',
          variant: 'h6',
          sx: { fontWeight: 'bold', mb: 2 }
        },
        data: [
          {
            label: 'Nome Applicazione',
            value: 'Test Application'
          },
          {
            label: 'URL Servizio',
            value: 'https://api.test.com/webhook'
          },
          {
            label: 'Tipo Servizio',
            value: 'Notifica Pagamento'
          }
        ],
        inline: true,
        divider: false
      });
    });

    it('should return general config and auth config sections for legacy service', () => {
      const t = useTestTranslation();
      const orgSilService: OrgSilServiceDecryptedDTO = {
        ...createBaseOrgSilService(),
        flagLegacy: true,
        legacyBasicAuthConfig: {
          authUrl: 'https://auth.test.com',
          user: 'testuser',
          authConfig: ''
        }
      };

      const result = getOrgSilServiceSectionsConfig(orgSilService, t);

      expect(result).toHaveLength(2);

      expect(result[0]?.title?.label).toBe('Configurazione Generale');
      expect(result[0]?.data).toHaveLength(3);

      expect(result[1]?.title?.label).toBe('Configurazione Autenticazione');
      expect(result[1]?.title?.sx).toEqual({
        fontWeight: 'bold',
        mb: 2,
        mt: 3
      });
      expect(result[1]?.data).toContainEqual({
        label: 'API Legacy',
        value: 'Sì'
      });
    });

    it('should handle different service types correctly', () => {
      const t = useTestTranslation();
      const orgSilServiceActualization: OrgSilServiceDecryptedDTO = {
        ...createBaseOrgSilService(),
        serviceType: OrgSilServiceType.ACTUALIZATION
      };

      const result = getOrgSilServiceSectionsConfig(
        orgSilServiceActualization,
        t
      );

      const serviceTypeField = result[0]?.data?.find(
        (item) => item.label === 'Tipo Servizio'
      );
      expect(serviceTypeField?.value).toBe('Attualizzazione Importo');
    });

    it('should handle unknown service type by returning the enum value', () => {
      const t = useTestTranslation();
      const orgSilService: OrgSilServiceDecryptedDTO = {
        ...createBaseOrgSilService(),
        serviceType: 'UNKNOWN_TYPE' as OrgSilServiceType
      };

      const result = getOrgSilServiceSectionsConfig(orgSilService, t);

      const serviceTypeField = result[0]?.data?.find(
        (item) => item.label === 'Tipo Servizio'
      );
      expect(serviceTypeField?.value).toBe('UNKNOWN_TYPE');
    });

    it('should build auth config with basic authentication', () => {
      const t = useTestTranslation();
      const orgSilService: OrgSilServiceDecryptedDTO = {
        ...createBaseOrgSilService(),
        flagLegacy: true,
        legacyBasicAuthConfig: {
          authUrl: 'https://auth.test.com',
          user: 'testuser',
          authConfig: ''
        }
      };

      const result = getOrgSilServiceSectionsConfig(orgSilService, t);
      const authSection = result[1];

      expect(authSection?.data).toContainEqual({
        label: 'API Legacy',
        value: 'Sì'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Tipo Autenticazione',
        value: 'Autenticazione Basic'
      });
      expect(authSection?.data).toContainEqual({
        label: 'URL Auth',
        value: 'https://auth.test.com'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Username',
        value: 'testuser'
      });
    });

    it('should build auth config with JWT authentication', () => {
      const t = useTestTranslation();
      const orgSilService: OrgSilServiceDecryptedDTO = {
        ...createBaseOrgSilService(),
        flagLegacy: true,
        legacyJwtAuthConfig: {
          kid: 'key123',
          issuer: 'https://issuer.test.com',
          subject: 'test-subject',
          algorithm: JwtAlgorithm.ES256,
          signingKey: 'signing-key-value',
          authConfig: ''
        }
      };

      const result = getOrgSilServiceSectionsConfig(orgSilService, t);
      const authSection = result[1];

      expect(authSection?.data).toContainEqual({
        label: 'API Legacy',
        value: 'Sì'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Tipo Autenticazione',
        value: 'Autenticazione JWT'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Key ID',
        value: 'key123'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Issuer',
        value: 'https://issuer.test.com'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Subject',
        value: 'test-subject'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Algoritmo',
        value: 'ES256'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Chiave Firma',
        value: 'signing-key-value'
      });
    });

    it('should handle missing values with default dash', () => {
      const t = useTestTranslation();
      const orgSilService: OrgSilServiceDecryptedDTO = {
        ...createBaseOrgSilService(),
        flagLegacy: true,
        legacyBasicAuthConfig: {
          authUrl: undefined,
          user: undefined,
          authConfig: ''
        }
      };

      const result = getOrgSilServiceSectionsConfig(orgSilService, t);
      const authSection = result[1];

      expect(authSection?.data).toContainEqual({
        label: 'URL Auth',
        value: '-'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Username',
        value: '-'
      });
    });

    it('should handle both basic and JWT auth configs simultaneously', () => {
      const t = useTestTranslation();
      const orgSilService: OrgSilServiceDecryptedDTO = {
        ...createBaseOrgSilService(),
        flagLegacy: true,
        legacyBasicAuthConfig: {
          authUrl: 'https://basic.auth.com',
          user: 'basicuser',
          authConfig: ''
        },
        legacyJwtAuthConfig: {
          kid: 'jwt-key',
          issuer: 'https://jwt.issuer.com',
          subject: 'jwt-subject',
          algorithm: JwtAlgorithm.ES256,
          signingKey: 'jwt-signing-key',
          authConfig: ''
        }
      };

      const result = getOrgSilServiceSectionsConfig(orgSilService, t);
      const authSection = result[1];

      expect(authSection?.data).toContainEqual({
        label: 'URL Auth',
        value: 'https://basic.auth.com'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Key ID',
        value: 'jwt-key'
      });

      const authTypeEntries =
        authSection?.data?.filter(
          (item) => item.label === 'Tipo Autenticazione'
        ) || [];
      expect(authTypeEntries).toHaveLength(2);
      expect(authTypeEntries[0]?.value).toBe('Autenticazione Basic');
      expect(authTypeEntries[1]?.value).toBe('Autenticazione JWT');
    });

    it('should handle empty JWT auth config values', () => {
      const t = useTestTranslation();
      const orgSilService: OrgSilServiceDecryptedDTO = {
        ...createBaseOrgSilService(),
        flagLegacy: true,
        legacyJwtAuthConfig: {
          kid: undefined,
          issuer: '',
          subject: undefined,
          algorithm: undefined,
          signingKey: '',
          authConfig: ''
        }
      };

      const result = getOrgSilServiceSectionsConfig(orgSilService, t);
      const authSection = result[1];

      expect(authSection?.data).toContainEqual({ label: 'Key ID', value: '-' });
      expect(authSection?.data).toContainEqual({ label: 'Issuer', value: '-' });
      expect(authSection?.data).toContainEqual({
        label: 'Subject',
        value: '-'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Algoritmo',
        value: '-'
      });
      expect(authSection?.data).toContainEqual({
        label: 'Chiave Firma',
        value: '-'
      });
    });
  });
});
