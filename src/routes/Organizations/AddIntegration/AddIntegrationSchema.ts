import { z } from 'zod';

import i18n from '@core/translations/i18n';
import utils from '@core/utils';
import { OrganizationApiKeyType } from '@generated/core/client';

import { IntegrationType, PdndOwnerType, EServiceOwnerType } from '../enums';

export const PAGOPA_KEY_TYPES = [
  OrganizationApiKeyType.IO,
  OrganizationApiKeyType.GENERATE_NOTICE
] as const;

export type PagoPAKeyType = (typeof PAGOPA_KEY_TYPES)[number];

const PDND_REQUIRED_FIELDS = [
  'clientName',
  'clientId',
  'kid',
  'publicKey',
  'privateKey'
] as const;

// The client id identifies the resource and cannot be changed in edit mode.
const PDND_EDIT_REQUIRED_FIELDS = [
  'clientName',
  'kid',
  'publicKey',
  'privateKey'
] as const;

const ESERVICE_REQUIRED_FIELDS = [
  'eServiceName',
  'purposeId',
  'clientId'
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
    .optional(),
  E_SERVICE: z
    .object({
      ownerType: z.nativeEnum(EServiceOwnerType),
      subUnitCode: z.string().optional(),
      eServiceName: z.string().optional(),
      purposeId: z.string().optional(),
      clientId: z.string().optional()
    })
    .optional()
});

export type AddIntegrationFormData = z.infer<typeof addIntegrationSchema>;
export type PagoPAFormData = NonNullable<
  AddIntegrationFormData['PAGOPA_PRODUCT']
>;
export type PdndFormData = NonNullable<AddIntegrationFormData['PDND_CLIENT']>;
export type EServiceFormData = NonNullable<AddIntegrationFormData['E_SERVICE']>;

// An edit of an existing resource, waiting for the user's confirmation.
export type PendingUpdate =
  | { type: 'eservice'; values: EServiceFormData }
  | { type: 'pdndClient'; values: PdndFormData };

export const DEFAULT_PDND_VALUES: PdndFormData = {
  ownerType: PdndOwnerType.ORGANIZATION,
  subUnitCode: '',
  clientName: '',
  clientId: '',
  kid: '',
  publicKey: '',
  privateKey: ''
};

export const isPagoPAKeyType = (value: string | null): value is PagoPAKeyType =>
  PAGOPA_KEY_TYPES.some((keyType) => keyType === value);

const addIssue = (
  ctx: z.RefinementCtx,
  path: Array<string | number>,
  message: string
) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

const validateRequiredFields = <T extends Record<string, unknown>>(
  ctx: z.RefinementCtx,
  section: Array<string | number>,
  values: T | undefined,
  fields: ReadonlyArray<keyof T & string>
) => {
  fields.forEach((field) => {
    const value = values?.[field];
    if (typeof value !== 'string' || !value.trim()) {
      addIssue(ctx, [...section, field], 'commons.required');
    }
  });
};

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

const validatePdnd = (
  values: AddIntegrationFormData,
  ctx: z.RefinementCtx,
  isEditMode: boolean
) => {
  const client = values.PDND_CLIENT;

  const requiredFields = isEditMode
    ? PDND_EDIT_REQUIRED_FIELDS
    : PDND_REQUIRED_FIELDS;

  validateRequiredFields(ctx, ['PDND_CLIENT'], client, requiredFields);

  // The sub-unit is mandatory only when the client belongs to a sub-unit
  if (
    !isEditMode &&
    client?.ownerType === PdndOwnerType.SUB_UNIT &&
    !client.subUnitCode
  ) {
    addIssue(
      ctx,
      ['PDND_CLIENT', 'subUnitCode'],
      'integrations.add.pdndClient.errors.subUnitRequired'
    );
  }
};

const ESERVICE_EDIT_REQUIRED_FIELDS = ['eServiceName', 'clientId'] as const;

const validateEService = (
  values: AddIntegrationFormData,
  ctx: z.RefinementCtx,
  noServiceAvailableToAdd: boolean,
  isEditMode: boolean
) => {
  if (noServiceAvailableToAdd && !isEditMode) {
    addIssue(
      ctx,
      ['flagIntegrationType'],
      'integrations.add.eService.errors.noServiceAvailable'
    );
  }
  const eService = values.E_SERVICE;

  const requiredFields = isEditMode
    ? ESERVICE_EDIT_REQUIRED_FIELDS
    : ESERVICE_REQUIRED_FIELDS;

  validateRequiredFields(ctx, ['E_SERVICE'], eService, requiredFields);

  // The sub-unit is mandatory only when the eService belongs to a sub-unit
  if (
    !isEditMode &&
    eService?.ownerType === EServiceOwnerType.SUB_UNIT &&
    !eService.subUnitCode
  ) {
    addIssue(
      ctx,
      ['E_SERVICE', 'subUnitCode'],
      'integrations.add.eService.errors.subUnitRequired'
    );
  }
};

/**
 * `noKeyAvailableToAdd`: in "add" mode, every PagoPA key type is already
 * configured for the organization, so a new PagoPA integration can't be added.
 * `isEditMode`: only the fields that can actually be changed are validated.
 */
export const createAddIntegrationSchema = (
  noKeyAvailableToAdd: boolean,
  noServiceAvailableToAdd: boolean,
  isEditMode = false
) =>
  addIntegrationSchema.superRefine((values, ctx) => {
    if (values.flagIntegrationType === IntegrationType.PAGOPA_PRODUCT) {
      validatePagoPA(values, ctx, noKeyAvailableToAdd);
    }
    if (values.flagIntegrationType === IntegrationType.PDND_CLIENT) {
      validatePdnd(values, ctx, isEditMode);
    }
    if (values.flagIntegrationType === IntegrationType.E_SERVICE) {
      validateEService(values, ctx, noServiceAvailableToAdd, isEditMode);
    }
  });

export const DEFAULT_ESERVICE_VALUES: EServiceFormData = {
  ownerType: EServiceOwnerType.ORGANIZATION,
  subUnitCode: '',
  eServiceName: '',
  purposeId: '',
  clientId: ''
};
