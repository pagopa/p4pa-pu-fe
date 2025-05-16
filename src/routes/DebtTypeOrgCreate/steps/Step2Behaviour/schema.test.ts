import { z } from 'zod';
import { PaymentMethodOption } from './components/PaymentMethodSelector';
import { step2Schema } from './schema';
import { TFunction } from 'i18next';

const t = ((key: string) => key) as TFunction; // Simple mock for translation

describe('step2Schema', () => {
  describe('Spontaneous Payment Validation', () => {
    const baseSpontaneousData = {
      flagSpontaneous: true,
      flagMandatoryDueDate: false,
      isAnonymousFiscalCode: false,
      flagNotifyOutcomePush: 'false',
      paymentMethod: PaymentMethodOption.FREE
    };

    it('should require amountCents for AMOUNT method', () => {
      const data = {
        ...baseSpontaneousData,
        paymentMethod: PaymentMethodOption.AMOUNT,
        amountCents: undefined
      };

      const result = step2Schema(t).safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]).toMatchObject({
        path: ['amountCents'],
        message: 'commons.validation.amountRequired'
      });
    });

    it('should require xsdDefinitionRef for CUSTOM method', () => {
      const data = {
        ...baseSpontaneousData,
        paymentMethod: PaymentMethodOption.CUSTOM,
        xsdDefinitionRef: undefined
      };

      const result = step2Schema(t).safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]).toMatchObject({
        path: ['xsdDefinitionRef'],
        message: 'debtTypeOrgCreate.behaviour.spontaneous.file.required'
      });
    });

    it('should validate externalPaymentUrl for EXTERNAL method', () => {
      const testCases = [
        { url: undefined, expectedError: 'fieldRequired' },
        { url: '', expectedError: 'fieldRequired' },
        { url: 'invalid-url', expectedError: 'invalidUrl' },
        { url: 'https://valid.com', expectedError: null }
      ];

      testCases.forEach(({ url, expectedError }) => {
        const data = {
          ...baseSpontaneousData,
          paymentMethod: PaymentMethodOption.EXTERNAL,
          externalPaymentUrl: url
        };

        const result = step2Schema(t).safeParse(data);
        if (expectedError) {
          expect(result.success).toBe(false);
          expect(result.error?.issues[0].message).toContain(expectedError);
        } else {
          expect(result.success).toBe(true);
        }
      });
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

      requiredFields.forEach((field) => {
        const invalidData = { ...baseNotificationData, [field]: '' };
        const result = step2Schema(t).safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual([field]);
      });
    });

    it('should require enableJwtAuth checkbox when flagNotifyOutcomePush is true', () => {
      const data = { ...baseNotificationData, enableJwtAuth: false };
      const result = step2Schema(t).safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]).toMatchObject({
        path: ['enableJwtAuth'],
        message: 'commons.validation.checkboxRequired'
      });
    });

    it('should validate clientEmail format', () => {
      const data = { ...baseNotificationData, clientEmail: 'invalid-email' };
      const result = step2Schema(t).safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].code).toBe(z.ZodIssueCode.invalid_string);
    });
  });

  describe('Edge Cases', () => {
    it('should pass validation when notifications are disabled', () => {
      const data = {
        flagSpontaneous: false,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'false'
        // no notification fields needed
      };

      const result = step2Schema(t).safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should ignore payment method validation when spontaneous payment disabled', () => {
      const data = {
        flagSpontaneous: false,
        paymentMethod: PaymentMethodOption.AMOUNT
        // Missing amountCents but should pass because flagSpontaneous is false
      };

      const result = step2Schema(t).safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
