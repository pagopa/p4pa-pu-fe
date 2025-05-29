import { z } from 'zod';
import { PaymentMethodOption } from './components/PaymentMethodSelector';
import { requireField, validateUrl } from '../../../../utils/schema';

export const step2Schema = z
  .object({
    flagSpontaneous: z.boolean().default(false),
    flagMandatoryDueDate: z.boolean().optional().default(false),
    isAnonymousFiscalCode: z.boolean().optional().default(false),

    paymentMethod: z.nativeEnum(PaymentMethodOption),
    amountCents: z.coerce.number().optional(),
    xsdDefinitionRef: z.any().optional(),
    externalPaymentUrl: z.string().optional(),

    flagNotifyOutcomePush: z.enum(['enabled', 'disabled']).default('disabled'),

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
  })
  .superRefine((data, ctx) => {
    validateSpontaneousPayment(data, ctx);
    validateNotifications(data, ctx);
  });

// Validation logic split into focused functions
const validateSpontaneousPayment = (
  data: z.infer<typeof step2Schema>,
  ctx: z.RefinementCtx
) => {
  if (!data.flagSpontaneous) return;

  switch (data.paymentMethod) {
    case PaymentMethodOption.AMOUNT:
      if (!data.amountCents) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'commons.validation.amountRequired',
          path: ['amountCents']
        });
      }
      break;

    case PaymentMethodOption.CUSTOM:
      if (!data.xsdDefinitionRef) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'debtTypeOrgCreate.behaviour.spontaneous.file.required',
          path: ['xsdDefinitionRef']
        });
      }
      break;

    case PaymentMethodOption.EXTERNAL:
      requireField(data, 'externalPaymentUrl', ctx);
      if (data.externalPaymentUrl) {
        validateUrl(data.externalPaymentUrl, 'externalPaymentUrl', ctx);
      }
      break;
  }
};

const validateNotifications = (
  data: z.infer<typeof step2Schema>,
  ctx: z.RefinementCtx
) => {
  if (data.flagNotifyOutcomePush !== 'enabled') return;

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

  requiredFields.forEach((field) => requireField(data, field, ctx));
};
