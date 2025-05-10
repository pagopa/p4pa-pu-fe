/**
 * File containing all types related to the payment system
 * Centralizes type definitions to improve maintainability and consistency
 */
import {
  Control,
  FieldArrayPath,
  FieldErrors,
  FieldValues,
  Path,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger
} from 'react-hook-form';

import { DebtPositionTypeEnum } from './DebtPositionType';

/**
 * Type representing a payment beneficiary
 */
export type Beneficiary = {
  /** Name of the beneficiary entity */
  entityName: string;
  /** Amount assigned to the beneficiary */
  amount: string;
  /** Tax code of the beneficiary */
  taxCode: string;
  /** Remittance information (payment reason) */
  remittance: string;
  /** IBAN of the beneficiary */
  iban: string;
  /** Taxonomy code */
  taxonomyCode: string;
  /** Unique ID of the beneficiary */
  id?: string;
  /** Flag indicating if the beneficiary was added after submit */
  isNew?: boolean;
};

/**
 * Type representing a single payment installment
 */
export type Installment = {
  /** Installment amount */
  amount: string;
  /** Installment due date */
  dueDate: string | null;
  /** Remittance information (payment reason) */
  remittance: string;
  /** Flag indicating if the installment has multiple beneficiaries */
  isMultibeneficiary: boolean;
  /** Flag indicating if beneficiaries are the same as the previous installment */
  sameBeneficiariesAsBefore?: boolean;
  /** List of installment beneficiaries */
  beneficiaries?: Array<Beneficiary>;
  /** Unique ID of the installment */
  id?: string;
  /** Flag indicating if the installment was added after submit */
  isNew?: boolean;
};

/**
 * Type representing available payment options
 * Uses DebtPositionTypeEnum to avoid duplication
 */
export type PaymentOption = DebtPositionTypeEnum;

/**
 * Type representing a property with value and readonly flag
 */
export type ReadonlyProperty<T> = {
  value: T;
  readonly: boolean;
};

/**
 * Complete payment configuration
 */
export type PaymentConfiguration = {
  paymentObject: ReadonlyProperty<string>;
  paymentOption: ReadonlyProperty<PaymentOption>;
  amount: ReadonlyProperty<string>;
  dueDate: ReadonlyProperty<string | null>;
  flagMandatoryDueDate: boolean;
  isMultibeneficiary: ReadonlyProperty<boolean>;
  beneficiaries?: Array<Beneficiary>;
  installments?: Array<Installment>;
};

/**
 * Utility types to simplify manipulation of payment objects
 */

/**
 * Extracts the actual value from a readonly property
 */
export type ExtractValue<T> = T extends ReadonlyProperty<infer U> ? U : never;

/**
 * Converts all ReadonlyProperty into simple values
 */
export type UnwrapReadonlyProperties<T> = {
  [K in keyof T]: T[K] extends ReadonlyProperty<infer U> ? U : T[K];
};

/**
 * Converts all simple values into ReadonlyProperty
 */
export type WrapAsReadonlyProperties<T> = {
  [K in keyof T]: T[K] extends ReadonlyProperty<unknown>
    ? T[K]
    : ReadonlyProperty<T[K]>;
};

/**
 * Type for field validators
 */
export type FieldValidator = Record<string, unknown>;

/**
 * Type for installment validators
 */
export type InstallmentValidators = {
  amount: FieldValidator;
  dueDate: {
    required: string | boolean;
    validate?: (value: unknown) => boolean | string;
  };
};

/**
 * Type for form values
 */
export type PaymentFormValues = {
  paymentObject: ReadonlyProperty<string>;
  paymentOption: ReadonlyProperty<PaymentOption>;
  amount: ReadonlyProperty<string>;
  dueDate: ReadonlyProperty<Date | null>;
  isMultibeneficiary: ReadonlyProperty<boolean>;
  beneficiaries?: Array<Beneficiary>;
  installments?: Array<Installment>;
};

/**
 * VALIDATION TYPES
 */

/**
 * Type for amount validation rules
 */
export type AmountValidationRules = {
  /** If the field is required */
  required: string;
  /** Error message if the value is invalid */
  invalidValue: string;
  /** Error message if the value is negative */
  negative: string;
  /** Error message if the value is zero */
  zero: string;
  /** Error message if the beneficiaries total doesn't match */
  totalMismatch: string;
};

/**
 * Type for date validation rules
 */
export type DateValidationRules = {
  /** If the field is required */
  required: string | boolean;
  /** Error message if the date is in the past */
  pastDate: string;
};

/**
 * Type for beneficiary validation rules
 */
export type BeneficiaryValidationRules = {
  /** Rules for amount */
  amount: AmountValidationRules;
  /** Rules for entity name */
  entityName: {
    required: string;
  };
  /** Rules for tax code */
  taxCode: {
    required: string;
    invalid: string;
  };
  /** Rules for remittance information */
  remittance: {
    required: string;
  };
  /** Rules for payment fields */
  paymentFields: {
    required: string;
  };
  /** Rules for taxonomy code */
  taxonomyCode: {
    required: string;
  };
};

/**
 * Type for validation results
 */
export type ValidationResult = {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message, if present */
  errorMessage?: string;
};

/**
 * Type that extends the validator function from react-hook-form
 * to add the return type
 */
export type TypedValidator = FieldValidator & {
  isValid?: (value: string) => ValidationResult;
};

/**
 * Type for validation context
 */
export type ValidationContext = {
  /** Total amount of payment or installment */
  totalAmount?: string;
  /** Flag indicating if the date is required */
  isDateRequired?: boolean;
  /** Custom message for required dates */
  requiredDateMessage?: string;
};

/**
 * Type for beneficiary field validators
 */
export type BeneficiaryFieldValidators = {
  /** Validator for beneficiary tax code */
  validateBeneficiaryTaxCode: (value: string) => string | undefined;
  /** Validator for remittance information */
  validateRemittance: (value: string) => string | undefined;
  /** Validator for IBAN */
  validateIBAN: (value: string) => string | undefined;
  /** Validator for postal account */
  validatePostalAccount: (value: string) => string | undefined;
  /** Validator for payment method (requires at least one between IBAN and postal account) */
  validatePaymentMethod: (
    iban: string,
    postalAccount: string
  ) => string | undefined;
};

/**
 * Validation context for beneficiaries
 */
export type BeneficiaryValidationContext<T extends FieldValues> = {
  /** Beneficiary ID */
  id: string;
  /** Index of the beneficiary in the list */
  index: number;
  /** Whether the form has been submitted */
  isSubmitted: boolean;
  /** Reference indicating if the form has been submitted */
  wasSubmittedRef: React.RefObject<boolean>;
  /** Registry of existing beneficiaries (pre-submit) */
  existingBeneficiaries: Record<string, boolean>;
  /** Form errors */
  errors: FieldErrors<T>;
  /** Prefix for beneficiary fields */
  fieldNamePrefix: string;
  /** Function to get values from the form */
  getValues: UseFormGetValues<T>;
  /** Translation function */
  t: (key: string) => string;
};

/**
 * TYPES FOR PAYMENT MANAGEMENT HOOKS
 */

/**
 * Base type for management hooks
 */
export type BaseHookProps<T extends FieldValues> = {
  /** Form control */
  readonly control: Control<T>;
  /** Flag indicating if the form has been submitted */
  readonly isSubmitted: boolean;
  /** Function to get form values */
  readonly getValues: UseFormGetValues<T>;
  /** Function to trigger validation */
  readonly trigger: UseFormTrigger<T>;
};

/**
 * Properties for beneficiary management hook
 */
export type BeneficiaryManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    /** Prefix to access beneficiary fields in the form */
    readonly fieldNamePrefix: FieldArrayPath<T>;
    /** Total payment or installment amount */
    readonly totalAmount: string;
    /** Function to set values in the form */
    readonly setValue?: UseFormSetValue<T>;
    /** Callback invoked when multi-beneficiary state changes */
    readonly onToggleMultibeneficiary?: (value: boolean) => void;
    /** Callback invoked when beneficiaries change */
    readonly onBeneficiariesChange?: (
      summary: Array<{
        id: string;
        index: number;
        isNew: boolean;
        dati: Record<string, unknown>;
      }>
    ) => void;
    /** Flag indicating if beneficiaries are within an installment */
    readonly isInsideInstallment?: boolean;
    /** Installment index (if inside an installment) */
    readonly installmentIndex?: number;
  };

/**
 * Properties for installment management hook
 */
export type InstallmentManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    /** Prefix to access installment fields in the form */
    readonly fieldNamePrefix: FieldArrayPath<T>;
    /** Function to set values in the form */
    readonly setValue: UseFormSetValue<T>;
    /** Flag indicating if the due date is mandatory */
    readonly flagMandatoryDueDate?: boolean;
    /** Callback invoked when installments change */
    readonly onInstallmentsChange?: (
      installments: Array<Installment>,
      totalAmount: string
    ) => void;
  };

/**
 * Properties for installment beneficiary management hook
 */
export type InstallmentBeneficiaryManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    /** Installment index */
    readonly index: number;
    /** Prefix to access installment fields in the form */
    readonly installmentsFieldNamePrefix: string;
    /** Function to set values in the form */
    readonly setValue: UseFormSetValue<T>;
    /** Callback invoked when multi-beneficiary state changes */
    readonly onToggleMultibeneficiary?: (value: boolean) => void;
  };

/**
 * Result of the beneficiary management hook
 */
export type BeneficiaryManagementResult = {
  /** Beneficiary fields */
  fields: Array<Record<string, unknown>>;
  /** Validators */
  validators: Record<string, unknown>;
  /** Field validators */
  fieldValidators: Record<string, unknown>;
  /** Maximum number of beneficiaries */
  MAX_BENEFICIARIES: number;
  /** Registry of existing beneficiaries */
  existingBeneficiaries: Record<string, boolean>;
  /** Ref indicating if the form has been submitted */
  wasSubmittedRef: { current: boolean };
  /** Ref indicating if initialization is in progress */
  isInitializingRef: { current: boolean };
  /** Function to add a beneficiary */
  addBeneficiary: () => void;
  /** Function to remove a beneficiary */
  removeBeneficiary: (index: number) => void;
  /** Function to reset all beneficiaries */
  resetAllBeneficiaries: () => void;
  /** Function to update amount validations */
  updateAmountValidations: () => void;
  /** Function to get the path of a beneficiary field */
  getBeneficiaryPath: <U extends FieldValues>(
    index: number,
    field?: string
  ) => Path<U>;
};

/**
 * Result of the installment management hook
 */
export type InstallmentManagementResult = {
  /** Installment fields */
  fields: Array<Record<string, unknown>>;
  /** Validators */
  validators: InstallmentValidators;
  /** Registry of existing installments */
  existingInstallments: Record<string, boolean>;
  /** Minimum number of installments */
  MIN_INSTALLMENTS: number;
  /** Maximum number of installments */
  MAX_INSTALLMENTS: number;
  /** Ref indicating if the form has been submitted */
  wasSubmittedRef: { current: boolean };
  /** Ref indicating if initialization is in progress */
  isInitializingRef: { current: boolean };
  /** Function to add an installment */
  addInstallment: () => void;
  /** Function to remove an installment */
  removeInstallment: (index: number) => void;
  /** Function to calculate total amount */
  calculateTotalAmount: () => string;
  /** Function to get installment data */
  getInstallmentsData: () => Array<Installment>;
};

/**
 * Result of the installment beneficiary management hook
 */
export type InstallmentBeneficiaryManagementResult =
  BeneficiaryManagementResult & {
    /** Flag indicating if the installment has multiple beneficiaries */
    isMultibeneficiary: boolean;
    /** Function to enable/disable multiple beneficiaries */
    toggleMultibeneficiary: (value: boolean) => void;
    /** Function to validate beneficiary amounts */
    validateBeneficiaryAmounts: () => void;
    /** Function to handle installment amount change */
    handleInstallmentAmountChange: (value: string) => void;
    /** Function to validate payment fields */
    validatePaymentFields: () => void;
  };
