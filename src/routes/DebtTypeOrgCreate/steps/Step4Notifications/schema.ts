import { z } from 'zod';

export const step4Schema = z
  .object({
    flagNotifyIo: z.boolean().optional().default(false),
    serviceId: z.string().optional(),
    ioTemplateSubject: z.string().optional(),
    ioTemplateMessage: z.string().optional()
  })
  .refine((data) => !data.flagNotifyIo || data.serviceId, {
    message: 'debtTypeOrgCreate.notifications.serviceApiKey.required',
    path: ['serviceId']
  })
  .refine((data) => !data.flagNotifyIo || data.ioTemplateSubject, {
    message: 'debtTypeOrgCreate.notifications.messageSubject.required',
    path: ['ioTemplateSubject']
  })
  .refine((data) => !data.flagNotifyIo || data.ioTemplateMessage, {
    message: 'debtTypeOrgCreate.notifications.messageBody.required',
    path: ['ioTemplateMessage']
  });
