import { z } from 'zod';
import { PaymentMethodOption } from './components/PaymentMethodSelector';
import { step2Schema } from './schema';

describe('step2Schema', () => {
  describe('Spontaneous Payment Validation', () => {
    const baseSpontaneousData = {
      flagSpontaneous: true,
      flagMandatoryDueDate: false,
      isAnonymousFiscalCode: false,
      flagNotifyOutcomePush: 'false',
      paymentMethod: PaymentMethodOption.AMOUNT
    };

    it('should require amountCents for AMOUNT method', () => {
      const data = {
        ...baseSpontaneousData,
        amountCents: undefined
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'amountCents' &&
              issue.message === 'commons.validation.amountRequired'
          )
        ).toBe(true);
      }
    });

    it('should require xsdDefinitionRef for CUSTOM method', () => {
      const data = {
        ...baseSpontaneousData,
        paymentMethod: PaymentMethodOption.CUSTOM,
        xsdDefinitionRef: undefined
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'xsdDefinitionRef' &&
              issue.message ===
                'debtTypeOrgCreate.behaviour.spontaneous.file.required'
          )
        ).toBe(true);
      }
    });

    it('should require and validate externalPaymentUrl for EXTERNAL method', () => {
      const dataMissingUrl = {
        ...baseSpontaneousData,
        paymentMethod: PaymentMethodOption.EXTERNAL,
        externalPaymentUrl: undefined
      };
      const resultMissing = step2Schema.safeParse(dataMissingUrl);
      expect(resultMissing.success).toBe(false);
      if (!resultMissing.success) {
        expect(
          resultMissing.error.issues.some(
            (issue) =>
              issue.path[0] === 'externalPaymentUrl' &&
              issue.message.includes('fieldRequired')
          )
        ).toBe(true);
      }

      const dataInvalidUrl = {
        ...baseSpontaneousData,
        paymentMethod: PaymentMethodOption.EXTERNAL,
        externalPaymentUrl: 'invalid-url'
      };
      const resultInvalid = step2Schema.safeParse(dataInvalidUrl);
      expect(resultInvalid.success).toBe(false);
      if (!resultInvalid.success) {
        expect(
          resultInvalid.error.issues.some(
            (issue) =>
              issue.path[0] === 'externalPaymentUrl' &&
              issue.message.includes('invalidUrl')
          )
        ).toBe(true);
      }

      const dataValidUrl = {
        ...baseSpontaneousData,
        paymentMethod: PaymentMethodOption.EXTERNAL,
        externalPaymentUrl: 'https://valid.url/path'
      };
      const resultValid = step2Schema.safeParse(dataValidUrl);
      expect(resultValid.success).toBe(true);
    });
  });

  describe('Payment Notifications Validation', () => {
    const baseNotificationData = {
      flagSpontaneous: false,
      paymentMethod: PaymentMethodOption.FREE,
      flagNotifyOutcomePush: 'true',
      notificationRetries: 3,
      notificationAppName: 'Test App',
      notificationEndpoint: 'https://api.example.com',
      enableJwtAuth: true,
      clientId: 'client-123',
      clientEmail: 'client@example.com',
      secretKeyId: 'key-123',
      secretKey: 'secret-123'
    };

    it('should require all notification fields when flagNotifyOutcomePush is true', () => {
      const requiredFields = [
        'notificationRetries',
        'notificationAppName',
        'notificationEndpoint',
        'clientId',
        'clientEmail',
        'secretKeyId',
        'secretKey'
      ];

      for (const field of requiredFields) {
        const invalidData = { ...baseNotificationData, [field]: undefined };
        const result = step2Schema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some((issue) => issue.path[0] === field)
          ).toBe(true);
        }
      }
    });

    it('should require enableJwtAuth checkbox when flagNotifyOutcomePush is true', () => {
      const data = { ...baseNotificationData, enableJwtAuth: false };
      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'enableJwtAuth' &&
              issue.message === 'commons.validation.checkboxRequired'
          )
        ).toBe(true);
      }
    });

    it('should validate clientEmail format', () => {
      const data = { ...baseNotificationData, clientEmail: 'invalid-email' };
      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'clientEmail' &&
              issue.code === z.ZodIssueCode.invalid_string
          )
        ).toBe(true);
      }
    });

    it('passes with valid notification data', () => {
      const result = step2Schema.safeParse(baseNotificationData);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('passes when notifications are disabled', () => {
      const data = {
        flagSpontaneous: false,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'false'
        // no notification fields required
      };
      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('ignores spontaneous payment validation when flagSpontaneous is false', () => {
      const data = {
        flagSpontaneous: false,
        paymentMethod: PaymentMethodOption.AMOUNT,
        amountCents: undefined
      };
      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
