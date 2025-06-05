import { z } from 'zod';
import { TFunction } from 'i18next';
import { Beneficiary } from './paymentTypes';
import {
  Step1Data,
  Step2Data,
  Step3Data,
  DebtPositionTypeEnum
} from './DebtPositionType';
import { formatDate } from '../utils/formatters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver } from 'react-hook-form';
import {
  createEntityNameFieldSchema,
  createAmountFieldSchema,
  createTaxCodeFieldSchema,
  createRemittanceFieldSchema,
  createIBANFieldSchema,
  createTaxonomyCodeFieldSchema
} from './BeneficiarySchema';
import {
  createInstallmentAmountFieldSchema,
  createInstallmentRemittanceFieldSchema,
  createInstallmentDueDateFieldSchema
} from './InstallmentSchema';
import { formatDateForApi } from '../utils/paymentUtility';
import {
  ManageDebtPositionDTO,
  ManageInstallmentDTO,
  ActionEnum,
  InstallmentDTO,
  TransferDTO,
  DebtPositionDetailDTO,
  PersonDTO
} from '../../generated/data-contracts';

/**
 * Base type for the installment structure in the form
 */
type FormInstallment = {
  amount: string;
  dueDate: Date | string | null;
  remittance: string;
  isMultibeneficiary: boolean;
  sameBeneficiariesAsBefore?: boolean;
  beneficiaries?: Array<Beneficiary>;
  id?: string;
  isNew?: boolean;
};

/**
 * Base type for form data used in validation functions
 * Note: all properties are optional to better handle partial validation
 */
type BaseFormData = {
  paymentObject?: { value: string; readonly: boolean };
  paymentOption?: { value: string; readonly: boolean };
  amount?: { value: string; readonly: boolean };
  dueDate?: { value: Date | null; readonly: boolean };
  isMultibeneficiary?: { value: boolean; readonly: boolean };
  flagMandatoryDueDate?: boolean;
  beneficiaries?: Array<Beneficiary>;
  installments?: Array<FormInstallment>;
  step1Data?: Step1Data;
  step2Data?: Step2Data;
};

/**
 * Type extending Step3Data but with dueDate.value as Date for form compatibility
 */
export type Step3FormValues = Omit<
  Step3Data,
  'dueDate' | 'flagMandatoryDueDate'
> & {
  dueDate: { value: Date | null; readonly: boolean };
  flagMandatoryDueDate?: boolean;
};

/**
 * Creates a Zod schema for the payment object field in Step3
 */
export const createPaymentObjectSchema = (t: TFunction) =>
  z.object({
    paymentObject: z.object({
      value: z.string().refine((val) => val.trim() !== '', {
        message: t('debtPositionCreateWizard.step3.paymentObject.required')
      }),
      readonly: z.boolean()
    })
  });

/**
 * Creates a Zod schema for the amount field in Step3
 */
export const createAmountSchema = (t: TFunction) =>
  z.object({
    amount: z.object({
      value: z
        .string()
        .nonempty(t('debtPositionCreateWizard.step3.amount.required'))
        .refine(
          (val) => !isNaN(parseFloat(val.replace(',', '.'))),
          t('debtPositionCreateWizard.step3.amount.invalidFormat')
        )
        .refine(
          (val) => parseFloat(val.replace(',', '.')) > 0,
          t('debtPositionCreateWizard.step3.amount.positive')
        )
        .refine((val) => {
          const parts = val.replace(',', '.').split('.');
          return parts.length === 1 || parts[1].length <= 2;
        }, t('debtPositionCreateWizard.step3.amount.tooManyDecimals')),
      readonly: z.boolean()
    })
  });

/**
 * Creates a Zod schema for the due date field in Step3
 */
export const createDueDateSchema = (t: TFunction, isMandatory = false) => {
  const baseSchema = z.object({
    dueDate: z.object({
      value: z.date().nullable(),
      readonly: z.boolean()
    })
  });

  return baseSchema.superRefine((data, ctx) => {
    if (isMandatory && !data.dueDate.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('debtPositionCreateWizard.step3.dueDate.required'),
        path: ['dueDate', 'value']
      });
      return;
    }

    if (data.dueDate.value !== null) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (data.dueDate.value < now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('debtPositionCreateWizard.step3.dueDate.futureDate'),
          path: ['dueDate', 'value']
        });
      }
    }
  });
};

/**
 * Handles validation of the payment option field
 */
function validatePaymentOption(
  data: BaseFormData,
  ctx: z.RefinementCtx,
  t: TFunction
) {
  if (!data.paymentOption?.value || data.paymentOption.value.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('debtPositionCreateWizard.step3.paymentOption.required'),
      path: ['paymentOption', 'value']
    });
  } else if (
    data.paymentOption.value !== DebtPositionTypeEnum.SINGLE &&
    data.paymentOption.value !== DebtPositionTypeEnum.INSTALLMENTS
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        t('debtPositionCreateWizard.step3.paymentOption.invalid') ||
        'Invalid value. Field must be "SINGLE" or "INSTALLMENTS"',
      path: ['paymentOption', 'value']
    });
  }
}

/**
 * Handles validation of fields for single payment
 */
function validateSinglePayment(
  data: BaseFormData,
  ctx: z.RefinementCtx,
  t: TFunction
) {
  const amountValue = data.amount?.value;

  if (!amountValue || amountValue.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('debtPositionCreateWizard.step3.amount.required'),
      path: ['amount', 'value']
    });
    return;
  }

  const normalizedAmount = amountValue.replace(',', '.');
  if (isNaN(parseFloat(normalizedAmount))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('debtPositionCreateWizard.step3.amount.invalidFormat'),
      path: ['amount', 'value']
    });
    return;
  }

  const numericAmount = parseFloat(normalizedAmount);
  if (numericAmount <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('debtPositionCreateWizard.step3.amount.positive'),
      path: ['amount', 'value']
    });
  }

  const parts = normalizedAmount.split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('debtPositionCreateWizard.step3.amount.tooManyDecimals'),
      path: ['amount', 'value']
    });
  }

  validateDueDate(data, ctx, t);
}

/**
 * Handles validation of the due date
 */
function validateDueDate(
  data: BaseFormData,
  ctx: z.RefinementCtx,
  t: TFunction
) {
  const isMandatory = data.flagMandatoryDueDate === true;

  if (isMandatory && (!data.dueDate || !data.dueDate.value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('debtPositionCreateWizard.step3.dueDate.required'),
      path: ['dueDate', 'value']
    });
  } else if (data.dueDate && data.dueDate.value) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (data.dueDate.value < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('debtPositionCreateWizard.step3.dueDate.futureDate'),
        path: ['dueDate', 'value']
      });
    }
  }
}

/**
 * Handles validation of beneficiaries in multi-beneficiary mode
 */
function validateMultiBeneficiary(
  data: BaseFormData,
  ctx: z.RefinementCtx,
  t: TFunction
) {
  const beneficiaries = data.beneficiaries || [];
  const totalAmount = data.amount?.value || '';

  if (beneficiaries.length > 0 && totalAmount) {
    if (beneficiaries.length === 1) {
      const beneficiaryAmount = parseFloat(beneficiaries[0].amount) || 0;
      const total = parseFloat(totalAmount);

      if (beneficiaryAmount >= total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t(
            'debtPositionCreateWizard.step3.beneficiary.amountMustBeLessThanTotal'
          ),
          path: ['beneficiaries', 0, 'amount']
        });
      }
    } else {
      const sum = beneficiaries.reduce((acc: number, curr: Beneficiary) => {
        return acc + (parseFloat(curr.amount) || 0);
      }, 0);

      const total = parseFloat(totalAmount);

      if (sum >= total) {
        beneficiaries.forEach((_: Beneficiary, index: number) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              'debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal'
            ),
            path: ['beneficiaries', index, 'amount']
          });
        });
      }
    }
  }
}

/**
 * Handles validation of installment due dates
 */
function validateInstallmentDueDate(
  installment: {
    dueDate?: Date | string | null;
  },
  installmentIndex: number,
  isDueDateMandatory: boolean,
  ctx: z.RefinementCtx,
  t: TFunction
) {
  if (isDueDateMandatory && !installment.dueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t(
        'debtPositionCreateWizard.step3.installments.dueDate.required'
      ),
      path: ['installments', installmentIndex, 'dueDate']
    });
  }

  if (installment.dueDate) {
    let date: Date;

    if (installment.dueDate instanceof Date) {
      date = installment.dueDate;
    } else {
      date = new Date(installment.dueDate);
    }

    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('debtPositionCreateWizard.step3.dueDate.invalid'),
        path: ['installments', installmentIndex, 'dueDate']
      });
    } else {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (date < now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('debtPositionCreateWizard.step3.dueDate.futureDate'),
          path: ['installments', installmentIndex, 'dueDate']
        });
      }
    }
  }
}

/**
 * Handles validation of installment beneficiary amounts
 */
function validateInstallmentBeneficiaryAmounts(
  installment: {
    amount?: string;
    isMultibeneficiary?: boolean;
    beneficiaries?: Array<Beneficiary>;
  },
  installmentIndex: number,
  ctx: z.RefinementCtx,
  t: TFunction
) {
  if (!installment.isMultibeneficiary) {
    return;
  }

  if (
    installment.amount &&
    installment.beneficiaries &&
    Array.isArray(installment.beneficiaries)
  ) {
    const total = parseFloat(installment.amount);
    if (!isNaN(total)) {
      installment.beneficiaries.forEach(
        (beneficiary: Beneficiary, beneficiaryIndex: number) => {
          if (beneficiary && beneficiary.amount) {
            const beneficiaryAmount = parseFloat(beneficiary.amount) || 0;

            if (beneficiaryAmount >= total) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t(
                  'debtPositionCreateWizard.step3.beneficiary.amountMustBeLessThanTotal'
                ),
                path: [
                  'installments',
                  installmentIndex,
                  'beneficiaries',
                  beneficiaryIndex,
                  'amount'
                ]
              });
            }
          }
        }
      );
    }
  }
}

/**
 * Handles validation of multi-beneficiaries for installments
 */
function validateInstallmentMultiBeneficiaries(
  installment: {
    amount?: string;
    isMultibeneficiary?: boolean;
    beneficiaries?: Array<Beneficiary>;
  },
  installmentIndex: number,
  ctx: z.RefinementCtx,
  t: TFunction
) {
  if (!installment.isMultibeneficiary) {
    return;
  }

  if (
    installment.isMultibeneficiary &&
    installment.beneficiaries &&
    installment.beneficiaries.length > 0
  ) {
    const beneficiaries = installment.beneficiaries;
    const installmentAmount = installment.amount;

    if (installmentAmount) {
      if (beneficiaries.length === 1) {
        const beneficiaryAmount = parseFloat(beneficiaries[0].amount) || 0;
        const total = parseFloat(installmentAmount);

        if (beneficiaryAmount >= total) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              'debtPositionCreateWizard.step3.beneficiary.amountMustBeLessThanTotal'
            ),
            path: [
              'installments',
              installmentIndex,
              'beneficiaries',
              0,
              'amount'
            ]
          });
        }
      } else {
        let sum = 0;
        beneficiaries.forEach((beneficiary: Beneficiary) => {
          const amount = parseFloat(beneficiary.amount) || 0;
          sum += amount;
        });

        const total = parseFloat(installmentAmount);

        if (sum >= total) {
          beneficiaries.forEach((_: Beneficiary, beneficiaryIndex: number) => {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                'debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal'
              ),
              path: [
                'installments',
                installmentIndex,
                'beneficiaries',
                beneficiaryIndex,
                'amount'
              ]
            });
          });
        }
      }
    }
  }
}

/**
 * Complete validation of installments
 */
function validateInstallments(
  data: BaseFormData,
  ctx: z.RefinementCtx,
  t: TFunction
) {
  const installments = data.installments || [];
  const isDueDateMandatory = data.flagMandatoryDueDate === true;

  installments.forEach((installment, installmentIndex: number) => {
    validateInstallmentDueDate(
      installment,
      installmentIndex,
      isDueDateMandatory,
      ctx,
      t
    );

    validateInstallmentBeneficiaryAmounts(
      installment,
      installmentIndex,
      ctx,
      t
    );

    validateInstallmentMultiBeneficiaries(
      installment,
      installmentIndex,
      ctx,
      t
    );
  });
}

/**
 * Utility function to check if sameBeneficiariesAsBefore is true
 * This handles both boolean and string values for consistency
 * @param value The value to check
 * @returns A boolean indicating if the value should be treated as true
 */
export function isSameBeneficiariesAsBeforeEnabled(value: unknown): boolean {
  return value === true || String(value) === 'true';
}

/**
 * Checks if an installment has valid beneficiaries
 * @param installment The installment to check
 * @returns true if the installment has at least one beneficiary, false otherwise
 */
export function hasValidBeneficiaries(installment: {
  beneficiaries?: Array<Beneficiary>;
}): boolean {
  return (
    !!installment.beneficiaries &&
    Array.isArray(installment.beneficiaries) &&
    installment.beneficiaries.length > 0
  );
}

/**
 * Complete schema for Step3 with conditional validation for payment object
 */
export const createStep3Schema = (t: TFunction) => {
  const entityNameSchema = createEntityNameFieldSchema(t);
  const amountFieldSchema = createAmountFieldSchema(t);
  const taxCodeFieldSchema = createTaxCodeFieldSchema(t);
  const remittanceFieldSchema = createRemittanceFieldSchema(t);

  // Base schema for beneficiaries that will be used conditionally
  const beneficiarySchema = z.object({
    entityName: entityNameSchema,
    amount: amountFieldSchema,
    taxCode: taxCodeFieldSchema,
    remittance: z.preprocess(
      (val) => (val === undefined || val === null ? '' : val),
      remittanceFieldSchema
    ),
    iban: createIBANFieldSchema(t),
    taxonomyCode: createTaxonomyCodeFieldSchema(t),
    id: z.string().optional(),
    isNew: z.boolean().optional()
  });

  // Schema for beneficiaries in installments, which can be conditional
  const installmentBeneficiariesSchema = z.array(beneficiarySchema).optional();

  const baseSchema = z.object({
    paymentObject: z.object({
      value: z.string(),
      readonly: z.boolean()
    }),
    paymentOption: z.object({
      value: z.string(),
      readonly: z.boolean()
    }),
    amount: z.object({
      value: z.string(),
      readonly: z.boolean()
    }),
    dueDate: z.object({
      value: z.date().nullable(),
      readonly: z.boolean()
    }),
    isMultibeneficiary: z.object({
      value: z.boolean(),
      readonly: z.boolean()
    }),
    flagMandatoryDueDate: z.boolean().optional().default(false),
    beneficiaries: z.array(beneficiarySchema).optional(),
    installments: z
      .array(
        z.object({
          amount: createInstallmentAmountFieldSchema(t),
          dueDate: createInstallmentDueDateFieldSchema(t),
          remittance: createInstallmentRemittanceFieldSchema(t),
          isMultibeneficiary: z.boolean(),
          sameBeneficiariesAsBefore: z
            .union([z.boolean(), z.string()])
            .transform(isSameBeneficiariesAsBeforeEnabled)
            .optional(),
          // Using the previously defined beneficiary schema
          beneficiaries: installmentBeneficiariesSchema,
          id: z.string().optional(),
          isNew: z.boolean().optional()
        })
      )
      .optional(),
    step1Data: z.any().optional(),
    step2Data: z.any().optional()
  });

  return baseSchema.superRefine((data, ctx) => {
    validatePaymentOption(data, ctx, t);

    const isInstallment =
      data.paymentOption.value === DebtPositionTypeEnum.INSTALLMENTS;

    if (
      !isInstallment &&
      (!data.paymentObject?.value || data.paymentObject.value.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('debtPositionCreateWizard.step3.paymentObject.required'),
        path: ['paymentObject', 'value']
      });
    }

    if (!isInstallment) {
      validateSinglePayment(data, ctx, t);

      if (data.isMultibeneficiary?.value === true) {
        validateMultiBeneficiary(data, ctx, t);
      }
    } else {
      validateInstallments(data, ctx, t);
    }
  });
};

/**
 * Helper function to convert form values to Step3Data
 * Handles conversion from Date to string for the dueDate field
 */
export const convertFormValuesToStep3Data = (
  formValues: Step3FormValues
): Step3Data => {
  return {
    ...formValues,
    dueDate: {
      ...formValues.dueDate,
      value:
        formValues.dueDate.value instanceof Date
          ? formatDate(formValues.dueDate.value.toISOString())
          : formValues.dueDate.value
    },
    flagMandatoryDueDate: formValues.flagMandatoryDueDate ?? false
  };
};

/**
 * Helper function to clean installments data before validation
 * Removes beneficiaries from installments where isMultibeneficiary is false
 * @param values Form values to clean
 * @param isSinglePayment Flag indicating if we are in single payment mode
 * @returns The cleaned form values
 */
export function cleanInstallmentsBeforeValidation<T extends Step3FormValues>(
  values: T,
  isSinglePayment: boolean
): T {
  if (
    isSinglePayment ||
    !values.installments ||
    !Array.isArray(values.installments) ||
    values.installments.length === 0
  ) {
    return values;
  }

  // Clean up installments by removing beneficiaries from non-multibeneficiary installments
  const cleanedValues = {
    ...values,
    installments: values.installments.map((installment) => {
      if (installment.isMultibeneficiary === false) {
        // If isMultibeneficiary is false, remove any beneficiaries
        return {
          ...installment,
          beneficiaries: []
        };
      }
      return installment;
    })
  };

  return cleanedValues;
}

/**
 * Recalculates beneficiary amounts based on sameBeneficiariesAsBefore and the proportion between installment amounts
 * @param installments Array of installments to process
 * @returns A new array of installments with updated beneficiary amounts
 */
export function recalculateBeneficiaryAmounts<T extends FormInstallment>(
  installments: Array<T>
): Array<T> {
  if (!installments || installments.length <= 1) {
    return installments;
  }

  return installments.map((installment, idx) => {
    // Skip first installment or installments without sameBeneficiariesAsBefore
    if (
      idx === 0 ||
      !isSameBeneficiariesAsBeforeEnabled(
        installment.sameBeneficiariesAsBefore
      ) ||
      !installment.isMultibeneficiary
    ) {
      return installment;
    }

    const prevInstallment = installments[idx - 1];
    const currentAmount = parseFloat(installment.amount);
    const prevAmount = parseFloat(prevInstallment.amount);

    // Calculate the ratio between installment amounts
    const ratio = currentAmount / prevAmount;

    // If there are beneficiaries to copy and both amounts are valid
    if (
      hasValidBeneficiaries(prevInstallment) &&
      !isNaN(ratio) &&
      ratio > 0 &&
      !isNaN(currentAmount) &&
      !isNaN(prevAmount)
    ) {
      // Update beneficiary amounts based on the ratio
      return {
        ...installment,
        beneficiaries:
          prevInstallment.beneficiaries?.map((prevBeneficiary) => {
            const prevBeneficiaryAmount = parseFloat(prevBeneficiary.amount);
            if (!isNaN(prevBeneficiaryAmount)) {
              const newAmount = (prevBeneficiaryAmount * ratio).toFixed(2);
              return {
                ...prevBeneficiary,
                amount: newAmount
              };
            }
            return prevBeneficiary;
          }) || []
      };
    }

    return installment;
  });
}

/**
 * Helper function to check if payment option is installments
 */
function isInstallmentOption(values: Step3FormValues): boolean {
  return values.paymentOption?.value === DebtPositionTypeEnum.INSTALLMENTS;
}

/**
 * Creates the resolver for react-hook-form based on the Step3 Zod schema
 * This function is ready to be used directly in useForm
 */
export const createStep3Resolver = (
  t: TFunction
): Resolver<Step3FormValues> => {
  const schema = createStep3Schema(t);

  return (values, context, options) => {
    const contextData = context?.context || {};
    const isMandatoryDueDate = contextData.flagMandatoryDueDate === true;
    const isSinglePayment =
      values.paymentOption?.value === DebtPositionTypeEnum.SINGLE;

    // PRE-PROCESSING PHASE: recalculate beneficiary amounts when sameBeneficiariesAsBefore is true
    if (
      !isSinglePayment &&
      values.installments &&
      values.installments.length > 0
    ) {
      // Using our utility function to recalculate amounts
      values.installments = recalculateBeneficiaryAmounts(values.installments);
    }

    // Clean up installments data before validation
    const cleanedValues = cleanInstallmentsBeforeValidation(
      values,
      isSinglePayment
    );

    // For single payment, remove installments completely
    if (isSinglePayment && cleanedValues.installments) {
      const singlePaymentValues = {
        ...cleanedValues,
        installments: undefined
      };

      const result = zodResolver(
        schema as unknown as z.ZodType<Step3FormValues>
      )(singlePaymentValues, context, options);
      return result;
    }

    // Special validation for mandatory due date
    if (!isInstallmentOption(cleanedValues) && isMandatoryDueDate) {
      if (!cleanedValues.dueDate?.value) {
        const result = {
          values: {},
          errors: {
            dueDate: {
              value: {
                type: 'custom',
                message: t('debtPositionCreateWizard.step3.dueDate.required')
              }
            }
          }
        };
        return result;
      }
    }

    // Proceed with standard validation
    return zodResolver(schema as unknown as z.ZodType<Step3FormValues>)(
      cleanedValues,
      context,
      options
    );
  };
};

/**
 * Converts Step3 form data to ManageDebtPositionDTO for the manage installments API
 * Uses the original installment structure and modifies only editable fields
 * Maintains the same structure returned by the GET request
 */
export function convertFormDataToManageDebtPositionDTO(
  step3Data: Step3FormValues,
  step2Data: Step2Data,
  paymentOptionId: number,
  originalDebtPositionDetail?: DebtPositionDetailDTO,
  step1Data?: Step1Data
): ManageDebtPositionDTO {
  if (!originalDebtPositionDetail?.paymentOptions?.[0]?.installments?.length) {
    throw new Error('No original installments found for modification');
  }

  const originalInstallments =
    originalDebtPositionDetail.paymentOptions[0].installments;
  const originalPaymentOption = originalDebtPositionDetail.paymentOptions[0];
  let installments: Array<ManageInstallmentDTO> = [];

  // Handle installment payments (with installments in the form)
  if (step3Data.installments && step3Data.installments.length > 0) {
    installments = step3Data.installments.map((formInstallment, index) => {
      const originalInstallment = originalInstallments[index];

      if (!originalInstallment) {
        throw new Error(`Original installment not found for index ${index}`);
      }

      // Update existing transfers with beneficiary data from the form
      const updatedTransfers: Array<TransferDTO> = [
        ...(originalInstallment.transfers || [])
      ];

      // If there are beneficiaries in the form, update corresponding transfers (transferIndex >= 2)
      if (
        formInstallment.beneficiaries &&
        formInstallment.beneficiaries.length > 0
      ) {
        formInstallment.beneficiaries.forEach(
          (beneficiary, beneficiaryIndex) => {
            const transferIndex = beneficiaryIndex + 2; // Beneficiaries start from transferIndex = 2
            const existingTransferIndex = updatedTransfers.findIndex(
              (t) => t.transferIndex === transferIndex
            );

            const updatedTransfer: TransferDTO = {
              ...updatedTransfers[existingTransferIndex],
              amountCents: Math.round(
                parseFloat(beneficiary.amount.replace(',', '.')) * 100
              ),
              remittanceInformation: beneficiary.remittance
            };

            if (existingTransferIndex >= 0) {
              updatedTransfers[existingTransferIndex] = updatedTransfer;
            }
          }
        );
      }

      // Update debtor while maintaining non-modifiable fields
      const updatedDebtor: PersonDTO = {
        ...originalInstallment.debtor,
        fiscalCode: step2Data.taxCode.value,
        fullName: step2Data.fullName.value,
        ...(step2Data.address.value && { address: step2Data.address.value }),
        ...(step2Data.civicNumber.value && {
          civic: step2Data.civicNumber.value
        }),
        ...(step2Data.zipCode.value && { postalCode: step2Data.zipCode.value }),
        ...(step2Data.city.value && { location: step2Data.city.value }),
        ...(step2Data.province.value && { province: step2Data.province.value }),
        nation:
          step2Data.country.value || originalInstallment.debtor.nation || 'IT'
      };

      // Create installment maintaining the complete original structure
      const updatedInstallment: InstallmentDTO = {
        ...originalInstallment,
        amountCents: Math.round(
          parseFloat(formInstallment.amount.replace(',', '.')) * 100
        ),
        ...(formInstallment.dueDate && {
          dueDate: formatDateForApi(formInstallment.dueDate)
        }),
        remittanceInformation: formInstallment.remittance,
        debtor: updatedDebtor,
        transfers: updatedTransfers
      };

      // Determine action: 'M' for existing installments, 'I' for new ones
      const action: ActionEnum = formInstallment.isNew
        ? ActionEnum.I
        : ActionEnum.M;

      return {
        action,
        installment: updatedInstallment
      };
    });
  }
  // Handle single payments
  else {
    const originalInstallment = originalInstallments[0];
    if (!originalInstallment) {
      throw new Error('No original installment found for single payment');
    }

    // Update transfers for beneficiaries if present
    const updatedTransfers: Array<TransferDTO> = [
      ...(originalInstallment.transfers || [])
    ];

    if (step3Data.beneficiaries && step3Data.beneficiaries.length > 0) {
      step3Data.beneficiaries.forEach((beneficiary, beneficiaryIndex) => {
        const transferIndex = beneficiaryIndex + 2;
        const existingTransferIndex = updatedTransfers.findIndex(
          (t) => t.transferIndex === transferIndex
        );

        const updatedTransfer: TransferDTO = {
          ...updatedTransfers[existingTransferIndex],
          amountCents: Math.round(
            parseFloat(beneficiary.amount.replace(',', '.')) * 100
          ),
          remittanceInformation: beneficiary.remittance
        };

        if (existingTransferIndex >= 0) {
          updatedTransfers[existingTransferIndex] = updatedTransfer;
        }
      });
    }

    // Update debtor
    const updatedDebtor: PersonDTO = {
      ...originalInstallment.debtor,
      fiscalCode: step2Data.taxCode.value,
      fullName: step2Data.fullName.value,
      ...(step2Data.address.value && { address: step2Data.address.value }),
      ...(step2Data.civicNumber.value && {
        civic: step2Data.civicNumber.value
      }),
      ...(step2Data.zipCode.value && { postalCode: step2Data.zipCode.value }),
      ...(step2Data.city.value && { location: step2Data.city.value }),
      ...(step2Data.province.value && { province: step2Data.province.value }),
      nation:
        step2Data.country.value || originalInstallment.debtor.nation || 'IT'
    };

    // Create updated installment maintaining the complete structure
    const updatedInstallment: InstallmentDTO = {
      ...originalInstallment,
      amountCents: Math.round(
        parseFloat(step3Data.amount.value.replace(',', '.')) * 100
      ),
      ...(step3Data.dueDate?.value && {
        dueDate: formatDateForApi(step3Data.dueDate.value)
      }),
      remittanceInformation: step3Data.paymentObject.value,
      debtor: updatedDebtor,
      transfers: updatedTransfers
    };

    installments = [
      {
        action: ActionEnum.M,
        installment: updatedInstallment
      }
    ];
  }

  // Create final DTO including descriptions
  const manageDTO: ManageDebtPositionDTO = {
    paymentOptionId,
    installments,
    ...(step1Data?.description?.value && {
      debtPositionDescription: step1Data.description.value
    }),
    ...(originalPaymentOption?.description && {
      paymentOptionDescription: originalPaymentOption.description
    })
  };

  return manageDTO;
}
