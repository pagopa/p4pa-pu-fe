import { z } from 'zod';
import { requireField, validateUrl } from '../../../../utils/schema';
import { PaymentMethodOption, SpontaneousMode } from '../../types';

export const step2Schema = z
  .object({
    flagSpontaneous: z.boolean().default(false),
    spontaneousMode: z.nativeEnum(SpontaneousMode).optional(),
    flagMandatoryDueDate: z.boolean().optional().default(false),
    flagAnonymousFiscalCode: z.boolean().optional().default(false),
    flagPresetAmount: z.boolean().optional().default(false),

    paymentMethod: z.nativeEnum(PaymentMethodOption),
    amountCents: z.coerce
      .number({ invalid_type_error: '' })
      .gt(0, 'commons.validation.minAmountRequired')
      .optional(),
    externalPaymentUrl: z.string().optional(),
    customFormId: z.coerce.number().optional(),

    flagNotifyOutcomePush: z.enum(['enabled', 'disabled']).default('disabled'),

    notifyOutcomePushOrgSilServiceId: z.coerce.number().optional(),
    amountActualizationOrgSilServiceId: z.coerce.number().optional()
  })
  .superRefine((data, ctx) => {
    validateSpontaneousPayment(data, ctx);
    validatePresetAmount(data, ctx);
    validateNotifications(data, ctx);
  });

// Validation logic split into focused functions
const validateSpontaneousPayment = (
  data: z.infer<typeof step2Schema>,
  ctx: z.RefinementCtx
) => {
  if (!data.flagSpontaneous) return;

  if (!data.spontaneousMode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'debtTypeOrgCreate.behaviour.spontaneousMode.required',
      path: ['spontaneousMode']
    });
  }

  if (data.spontaneousMode === SpontaneousMode.EXTERNAL_URL) {
    if (!data.externalPaymentUrl || data.externalPaymentUrl.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.required',
        path: ['externalPaymentUrl']
      });
    } else {
      validateUrl(data.externalPaymentUrl, 'externalPaymentUrl', ctx);
    }
  }

  if (data.spontaneousMode === SpontaneousMode.CUSTOM_FORM) {
    requireField(data, 'customFormId', ctx);
  }

  switch (data.paymentMethod) {
    case PaymentMethodOption.AMOUNT:
      if (!data.flagPresetAmount) break;
      if (!data.amountCents) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'commons.validation.amountRequired',
          path: ['amountCents']
        });
      }
      break;

    case PaymentMethodOption.EXTERNAL:
      if (!data.externalPaymentUrl || data.externalPaymentUrl.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.required',
          path: ['externalPaymentUrl']
        });
      } else {
        validateUrl(data.externalPaymentUrl, 'externalPaymentUrl', ctx);
      }
      break;
  }
};

const validatePresetAmount = (
  data: z.infer<typeof step2Schema>,
  ctx: z.RefinementCtx
) => {
  if (!data.flagPresetAmount) return;

  if (!data.amountCents) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'commons.validation.amountRequired',
      path: ['amountCents']
    });
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
