import { z } from 'zod';
import { TFunction } from 'i18next';
import { PaymentMethodOption } from './components/PaymentMethodSelector';
import { requireField, validateUrl } from '../../../../utils/schema';

// Main schema
export const step2Schema = (t: TFunction) => {
  const baseSchema = z.object({
    isSpontaneousPaymentEnabled: z.boolean().default(false),
    isDueDateRequired: z.boolean().optional().default(false),
    isAnonymousFiscalCode: z.boolean().optional().default(false),

    paymentMethod: z.nativeEnum(PaymentMethodOption),
    fixedAmount: z.coerce.number().optional(),
    customFieldsSchema: z.any().optional(),
    externalPaymentUrl: z.string().optional(),

    enablePaymentNotifications: z.enum(['true', 'false']).default('false'),

    notificationRetries: z.coerce.number().optional(),
    notificationAppName: z.string().optional(),
    notificationEndpoint: z.string().optional(),
    enableJwtAuth: z.boolean().optional(),
    clientId: z.string().optional(),
    clientEmail: z.string().email().optional(),
    secretKeyId: z.string().optional(),
    secretKey: z.string().optional(),

    authenticateUsername: z.string().optional(),
    authenticatePassword: z.string().optional(),
    authCallbackUrl: z.string().optional(),
    updateCallbackUrl: z.string().optional()
  });

  return baseSchema.superRefine((data, ctx) => {
    validateSpontaneousPayment(data, ctx, t);
    validateNotifications(data, ctx, t);
  });
};

// Validation logic split into focused functions
const validateSpontaneousPayment = (
  data: z.infer<ReturnType<typeof step2Schema>>,
  ctx: z.RefinementCtx,
  t: TFunction
) => {
  if (!data.isSpontaneousPaymentEnabled) return;

  switch (data.paymentMethod) {
    case PaymentMethodOption.AMOUNT:
      if (!data.fixedAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('commons.validation.amountRequired'),
          path: ['fixedAmount']
        });
      }
      break;

    case PaymentMethodOption.CUSTOM:
      if (!data.customFieldsSchema) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('debtTypeCreateEC.behaviour.spontaneous.file.required'),
          path: ['customFieldsSchema']
        });
      }
      break;

    case PaymentMethodOption.EXTERNAL:
      requireField(data, 'externalPaymentUrl', t, ctx);
      if (data.externalPaymentUrl) {
        validateUrl(data.externalPaymentUrl, 'externalPaymentUrl', t, ctx);
      }
      break;
  }
};

const validateNotifications = (
  data: z.infer<ReturnType<typeof step2Schema>>,
  ctx: z.RefinementCtx,
  t: TFunction
) => {
  if (data.enablePaymentNotifications !== 'true') return;

  // Validate required fields
  const requiredFields = [
    'notificationRetries',
    'notificationAppName',
    'notificationEndpoint',
    'clientId',
    'clientEmail',
    'secretKeyId',
    'secretKey'
  ] as const;

  requiredFields.forEach((field) => requireField(data, field, t, ctx));

  // Validate checkbox
  if (!data.enableJwtAuth) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('commons.validation.checkboxRequired'),
      path: ['enableJwtAuth']
    });
  }
};
