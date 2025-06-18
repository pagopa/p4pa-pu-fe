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

    notifyOutcomePushOrgSilServiceId: z.coerce.number().optional(),
    amountActualizationOrgSilServiceId: z.coerce.number().optional()
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

  if (
    !data.notifyOutcomePushOrgSilServiceId ||
    data.notifyOutcomePushOrgSilServiceId === 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'debtTypeOrgCreate.behaviour.notifications.configuration.required',
      path: ['notifyOutcomePushOrgSilServiceId']
    });
  }
};
