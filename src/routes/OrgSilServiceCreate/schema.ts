import { z } from 'zod';
import {
  OrgSilServiceType,
  JwtAlgorithm
} from '../../../generated/data-contracts';
import { t } from 'i18next';

export const orgSilServiceFormSchema = z
  .object({
    applicationName: z
      .string()
      .min(1, t('orgSilServiceCreate.validations.requiredAPIName')),
    serviceUrl: z
      .string()
      .min(1, t('orgSilServiceCreate.validations.requiredURL'))
      .url(t('orgSilServiceCreate.validations.invalidURL')),
    serviceType: z.nativeEnum(OrgSilServiceType, {
      required_error: t('orgSilServiceCreate.validations.requiredServiceType')
    }),
    flagLegacy: z.boolean(),
    authConfigType: z.enum(['basic', 'jwt']).optional(),
    basicUser: z.string().optional(),
    basicPassword: z.string().optional(),
    basicAuthURL: z.string().optional(),
    jwtKid: z.string().optional(),
    jwtIssuer: z.string().optional(),
    jwtSubject: z.string().optional(),
    jwtAlgorithm: z.nativeEnum(JwtAlgorithm).optional(),
    jwtSigningKey: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (!data.flagLegacy) {
      return;
    }

    if (!data.authConfigType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('orgSilServiceCreate.validations.requiredLegacyType'),
        path: ['authConfigType']
      });
      return;
    }

    if (data.authConfigType === 'basic') {
      if (!data.basicUser)
        ctx.addIssue({
          code: 'custom',
          message: t('orgSilServiceCreate.validations.requiredField'),
          path: ['basicUser']
        });
      if (!data.basicPassword)
        ctx.addIssue({
          code: 'custom',
          message: t('orgSilServiceCreate.validations.requiredField'),
          path: ['basicPassword']
        });

      if (!data.basicAuthURL) {
        ctx.addIssue({
          code: 'custom',
          message: t('orgSilServiceCreate.validations.requiredField'),
          path: ['basicAuthURL']
        });
      } else {
        const urlCheck = z.string().url().safeParse(data.basicAuthURL);
        if (!urlCheck.success) {
          ctx.addIssue({
            code: 'custom',
            message: t('orgSilServiceCreate.validations.invalidURL'),
            path: ['basicAuthURL']
          });
        }
      }
    }

    if (data.authConfigType === 'jwt') {
      if (!data.jwtKid)
        ctx.addIssue({
          code: 'custom',
          message: t('orgSilServiceCreate.validations.requiredField'),
          path: ['jwtKid']
        });
      if (!data.jwtIssuer)
        ctx.addIssue({
          code: 'custom',
          message: t('orgSilServiceCreate.validations.requiredField'),
          path: ['jwtIssuer']
        });
      if (!data.jwtSubject)
        ctx.addIssue({
          code: 'custom',
          message: t('orgSilServiceCreate.validations.requiredField'),
          path: ['jwtSubject']
        });
      if (!data.jwtAlgorithm)
        ctx.addIssue({
          code: 'custom',
          message: t('orgSilServiceCreate.validations.requiredField'),
          path: ['jwtAlgorithm']
        });
      if (!data.jwtSigningKey)
        ctx.addIssue({
          code: 'custom',
          message: t('orgSilServiceCreate.validations.requiredField'),
          path: ['jwtSigningKey']
        });
    }
  });

export type OrgSilServiceFormData = z.infer<typeof orgSilServiceFormSchema>;
