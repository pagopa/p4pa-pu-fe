import { PaymentMethodOption, SpontaneousMode } from '../../types';
import { step2Schema } from './schema';

describe('step2Schema', () => {
  describe('Spontaneous Payment Validation', () => {
    const baseSpontaneousData = {
      flagSpontaneous: true,
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagNotifyOutcomePush: 'disabled' as const,
      paymentMethod: PaymentMethodOption.AMOUNT
    };

    it('should require amountCents for AMOUNT method when preset is enabled', () => {
      const data = {
        ...baseSpontaneousData,
        flagPresetAmount: true,
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

    it('should not require amountCents for AMOUNT method when preset is disabled', () => {
      const data = {
        ...baseSpontaneousData,
        flagPresetAmount: false,
        amountCents: undefined,
        spontaneousMode: SpontaneousMode.STANDARD
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require and validate externalPaymentUrl for EXTERNAL_URL spontaneous mode', () => {
      const dataMissingUrl = {
        ...baseSpontaneousData,
        spontaneousMode: SpontaneousMode.EXTERNAL_URL,
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
              issue.message ===
                'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.required'
          )
        ).toBe(true);
      }

      const dataInvalidUrl = {
        ...baseSpontaneousData,
        spontaneousMode: SpontaneousMode.EXTERNAL_URL,
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
        spontaneousMode: SpontaneousMode.EXTERNAL_URL,
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
      flagNotifyOutcomePush: 'enabled' as const,
      notifyOutcomePushOrgSilServiceId: 123
    };

    it('should require notifyOutcomePushOrgSilServiceId when flagNotifyOutcomePush is enabled', () => {
      const dataWithoutServiceId = {
        ...baseNotificationData,
        notifyOutcomePushOrgSilServiceId: undefined
      };

      const result = step2Schema.safeParse(dataWithoutServiceId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'notifyOutcomePushOrgSilServiceId' &&
              issue.message ===
                'debtTypeOrgCreate.behaviour.notifications.configuration.required'
          )
        ).toBe(true);
      }
    });

    it('should reject zero value for notifyOutcomePushOrgSilServiceId', () => {
      const dataWithZeroServiceId = {
        ...baseNotificationData,
        notifyOutcomePushOrgSilServiceId: 0
      };

      const result = step2Schema.safeParse(dataWithZeroServiceId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'notifyOutcomePushOrgSilServiceId' &&
              issue.message ===
                'debtTypeOrgCreate.behaviour.notifications.configuration.required'
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
        flagNotifyOutcomePush: 'disabled' as const
      };
      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('ignores spontaneous payment validation when flagSpontaneous is false', () => {
      const data = {
        flagSpontaneous: false,
        paymentMethod: PaymentMethodOption.AMOUNT,
        amountCents: undefined,
        flagNotifyOutcomePush: 'disabled' as const
      };
      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Preset Amount Validation', () => {
    it('should require amountCents when flagPresetAmount is true', () => {
      const data = {
        flagSpontaneous: false,
        flagPresetAmount: true,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const,
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

    it('should pass when flagPresetAmount is true and amountCents is provided', () => {
      const data = {
        flagSpontaneous: false,
        flagPresetAmount: true,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const,
        amountCents: 100
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should not validate amountCents when flagPresetAmount is false', () => {
      const data = {
        flagSpontaneous: false,
        flagPresetAmount: false,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const,
        amountCents: undefined
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Spontaneous Mode Validation', () => {
    it('should require spontaneousMode when flagSpontaneous is true', () => {
      const data = {
        flagSpontaneous: true,
        spontaneousMode: undefined,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'spontaneousMode' &&
              issue.message ===
                'debtTypeOrgCreate.behaviour.spontaneousMode.required'
          )
        ).toBe(true);
      }
    });

    it('should require customFormId for CUSTOM_FORM spontaneous mode', () => {
      const data = {
        flagSpontaneous: true,
        spontaneousMode: SpontaneousMode.CUSTOM_FORM,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const,
        customFormId: undefined
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'customFormId' &&
              issue.message === 'commons.validation.fieldRequired'
          )
        ).toBe(true);
      }
    });

    it('should pass with valid CUSTOM_FORM spontaneous mode', () => {
      const data = {
        flagSpontaneous: true,
        spontaneousMode: SpontaneousMode.CUSTOM_FORM,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const,
        customFormId: 123
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Amount Validation', () => {
    it('should reject amountCents when value is zero', () => {
      const data = {
        flagSpontaneous: false,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const,
        amountCents: 0
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'amountCents' &&
              issue.message === 'commons.validation.minAmountRequired'
          )
        ).toBe(true);
      }
    });

    it('should reject amountCents when value is negative', () => {
      const data = {
        flagSpontaneous: false,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const,
        amountCents: -10
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path[0] === 'amountCents' &&
              issue.message === 'commons.validation.minAmountRequired'
          )
        ).toBe(true);
      }
    });

    it('should accept positive amountCents values', () => {
      const data = {
        flagSpontaneous: false,
        paymentMethod: PaymentMethodOption.FREE,
        flagNotifyOutcomePush: 'disabled' as const,
        amountCents: 100
      };

      const result = step2Schema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
