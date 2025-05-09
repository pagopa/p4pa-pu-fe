import { z } from 'zod';
import { TFunction } from 'i18next';
import { PaymentMethodOption } from './components/PaymentMethodSelector';

export const step2Schema = (t: TFunction) =>
  z
    .object({
      isSpontaneousPaymentEnabled: z.boolean().default(false),

      isDueDateRequired: z.boolean().optional().default(false),
      isAnonymousFiscalCode: z.boolean().optional().default(false),

      paymentMethod: z.nativeEnum(PaymentMethodOption),
      fixedAmount: z.string().optional(),
      customFieldsSchema: z.any().optional(),
      externalPaymentUrl: z.string().optional(),

      enablePaymentNotifications: z.string().default('false'),

      notificationRetries: z.string().optional(),
      notificationAppName: z.string().optional(),
      notificationEndpoint: z.string().optional(),
      enableJwtAuth: z.boolean().optional(),
      clientId: z.string().optional(),
      clientEmail: z.string().optional(),
      secretKeyId: z.string().optional(),
      secretKey: z.string().optional(),

      authenticateUsername: z.string().optional(),
      authenticatePassword: z.string().optional(),
      authCallbackUrl: z.string().optional(),
      updateCallbackUrl: z.string().optional()
    })
    .superRefine((data, ctx) => {
      if (data.isSpontaneousPaymentEnabled) {
        if (
          data.paymentMethod === PaymentMethodOption.AMOUNT &&
          !data.fixedAmount
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.amountRequired'),
            path: ['fixedAmount']
          });
        }
        if (
          data.paymentMethod === PaymentMethodOption.CUSTOM &&
          !data.customFieldsSchema
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('debtTypeCreateEC.behaviour.spontaneous.file.required'),
            path: ['customFieldsSchema']
          });
        }
        if (data.paymentMethod === PaymentMethodOption.EXTERNAL) {
          if (
            !data.externalPaymentUrl ||
            data.externalPaymentUrl.trim() === ''
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('commons.validation.urlRequired'),
              path: ['externalPaymentUrl']
            });
          } else if (!/^https?:\/\/\S+\.\S+/.test(data.externalPaymentUrl)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('commons.validation.invalidUrl'),
              path: ['externalPaymentUrl']
            });
          }
        }
      }

      if (data.enablePaymentNotifications === 'true') {
        if (
          !data.notificationRetries ||
          data.notificationRetries.trim() === ''
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.fieldRequired'),
            path: ['notificationRetries']
          });
        }

        if (
          !data.notificationAppName ||
          data.notificationAppName.trim() === ''
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.fieldRequired'),
            path: ['notificationAppName']
          });
        }

        if (
          !data.notificationEndpoint ||
          data.notificationEndpoint.trim() === ''
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.fieldRequired'),
            path: ['notificationEndpoint']
          });
        }

        if (data.enableJwtAuth !== true) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.checkboxRequired'),
            path: ['enableJwtAuth']
          });
        }

        if (!data.clientId || data.clientId.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.fieldRequired'),
            path: ['clientId']
          });
        }

        if (!data.clientEmail || data.clientEmail.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.fieldRequired'),
            path: ['clientEmail']
          });
        }

        if (!data.secretKeyId || data.secretKeyId.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.fieldRequired'),
            path: ['secretKeyId']
          });
        }

        if (!data.secretKey || data.secretKey.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('commons.validation.fieldRequired'),
            path: ['secretKey']
          });
        }
      }
    });
