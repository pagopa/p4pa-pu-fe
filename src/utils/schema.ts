import { z } from 'zod';

// Helper functions for common validation patterns
export function requireField<T, K extends keyof T>(
  data: T,
  key: K,
  ctx: z.RefinementCtx
) {
  const value = data[key];
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'commons.validation.fieldRequired',
      path: [key as string]
    });
  }
}

export const validateUrl = (
  url: string,
  path: string,
  ctx: z.RefinementCtx
) => {
  if (!/^https?:\/\/\S+\.\S+/.test(url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'commons.validation.invalidUrl',
      path: [path]
    });
  }
};
