import { z } from 'zod';

import i18n from '@core/translations/i18n';
import utils from '@core/utils';
import { OrganizationApiKeyType } from '@generated/core/client';

import { IntegrationType, PdndOwnerType } from '../enums';

export const PAGOPA_KEY_TYPES = [
  OrganizationApiKeyType.IO,
  OrganizationApiKeyType.GENERATE_NOTICE
] as const;

const PDND_REQUIRED_FIELDS = [
  'clientName',
  'clientId',
  'kid',
  'publicKey',
  'privateKey'
] as const;

export const addIntegrationSchema = z.object({
  flagIntegrationType: z
    .nativeEnum(IntegrationType, {
      errorMap: () => ({ message: 'commons.validation.selectAtLeastOneOption' })
    })
    .optional()
    .superRefine((value) => {
      if (value === undefined) {
        utils.notify.emit(
          i18n.t('integrations.add.errors.selectAtLeastOneOption.title')
        );
      }
    }),
  PAGOPA_PRODUCT: z
    .object({
      keyType: z
        .union([z.literal(PAGOPA_KEY_TYPES[0]), z.literal(PAGOPA_KEY_TYPES[1])])
        .optional(),
      apiKey: z.string().optional(),
      serviceEnabled: z.boolean().optional()
    })
    .optional(),
  PDND_CLIENT: z
    .object({
      ownerType: z.nativeEnum(PdndOwnerType),
      subUnitCode: z.string().optional(),
      clientName: z.string().optional(),
      clientId: z.string().optional(),
      kid: z.string().optional(),
      publicKey: z.string().optional(),
      privateKey: z.string().optional()
    })
    .optional()
});

export type AddIntegrationFormData = z.infer<typeof addIntegrationSchema>;
export type PagoPAFormData = NonNullable<
  AddIntegrationFormData['PAGOPA_PRODUCT']
>;
export type PdndFormData = NonNullable<AddIntegrationFormData['PDND_CLIENT']>;

export const DEFAULT_PDND_VALUES: PdndFormData = {
  ownerType: PdndOwnerType.ORGANIZATION,
  subUnitCode: '',
  clientName: '',
  clientId: '',
  kid: '',
  publicKey: '',
  privateKey: ''
};

export const isPagoPAKeyType = (
  value: string | null
): value is (typeof PAGOPA_KEY_TYPES)[number] =>
  PAGOPA_KEY_TYPES.some((keyType) => keyType === value);

const addIssue = (
  ctx: z.RefinementCtx,
  path: Array<string | number>,
  message: string
) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

const validatePagoPA = (
  values: AddIntegrationFormData,
  ctx: z.RefinementCtx,
  noKeyAvailableToAdd: boolean
) => {
  if (noKeyAvailableToAdd) {
    addIssue(
      ctx,
      ['flagIntegrationType'],
      'integrations.add.pagoPaProduct.errors.noIntegrationAvailable'
    );
  }
  if (!values.PAGOPA_PRODUCT?.apiKey) {
    addIssue(
      ctx,
      ['PAGOPA_PRODUCT', 'apiKey'],
      'integrations.add.pagoPaProduct.errors.apiKey.title'
    );
  }
};

const validatePdnd = (values: AddIntegrationFormData, ctx: z.RefinementCtx) => {
  const client = values.PDND_CLIENT;

  PDND_REQUIRED_FIELDS.forEach((field) => {
    if (!client?.[field]?.trim()) {
      addIssue(ctx, ['PDND_CLIENT', field], 'commons.required');
    }
  });

  // The sub-unit is mandatory only when the client belongs to a sub-unit
  if (client?.ownerType === PdndOwnerType.SUB_UNIT && !client.subUnitCode) {
    addIssue(
      ctx,
      ['PDND_CLIENT', 'subUnitCode'],
      'integrations.add.pdndClient.errors.subUnitRequired'
    );
  }
};

/**
 * `noKeyAvailableToAdd`: in "add" mode, every PagoPA key type is already
 * configured for the organization, so a new PagoPA integration can't be added.
 */
export const createAddIntegrationSchema = (noKeyAvailableToAdd: boolean) =>
  addIntegrationSchema.superRefine((values, ctx) => {
    if (values.flagIntegrationType === IntegrationType.PAGOPA_PRODUCT) {
      validatePagoPA(values, ctx, noKeyAvailableToAdd);
    }
    if (values.flagIntegrationType === IntegrationType.PDND_CLIENT) {
      validatePdnd(values, ctx);
    }
  });
