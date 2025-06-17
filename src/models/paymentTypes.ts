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

export type Beneficiary = {
  entityName: string;
  amount: string;
  taxCode: string;
  remittance: string;
  iban: string;
  postalIban?: string;
  taxonomyCode: string;
  id?: string;
  isNew?: boolean;
  readonly?: {
    entityName?: boolean;
    amount?: boolean;
    taxCode?: boolean;
    remittance?: boolean;
    iban?: boolean;
    postalIban?: boolean;
    taxonomyCode?: boolean;
  };
};

export type Installment = {
  amount: string;
  dueDate: string | null;
  remittance: string;
  isMultibeneficiary: boolean;
  sameBeneficiariesAsBefore?: boolean;
  beneficiaries?: Array<Beneficiary>;
  id?: string;
  isNew?: boolean;
  readonly?: {
    amount?: boolean;
    dueDate?: boolean;
    remittance?: boolean;
    isMultibeneficiary?: boolean;
  };
};

export type PaymentOption = DebtPositionTypeEnum;

export type ReadonlyProperty<T> = {
  value: T;
  readonly: boolean;
};

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

export type ExtractValue<T> = T extends ReadonlyProperty<infer U> ? U : never;

export type UnwrapReadonlyProperties<T> = {
  [K in keyof T]: T[K] extends ReadonlyProperty<infer U> ? U : T[K];
};

export type WrapAsReadonlyProperties<T> = {
  [K in keyof T]: T[K] extends ReadonlyProperty<unknown>
    ? T[K]
    : ReadonlyProperty<T[K]>;
};

export type FieldValidator = Record<string, unknown>;

export type InstallmentValidators = {
  amount: FieldValidator;
  dueDate: {
    required: string | boolean;
    validate?: (value: unknown) => boolean | string;
  };
};

export type PaymentFormValues = {
  paymentObject: ReadonlyProperty<string>;
  paymentOption: ReadonlyProperty<PaymentOption>;
  amount: ReadonlyProperty<string>;
  dueDate: ReadonlyProperty<Date | null>;
  isMultibeneficiary: ReadonlyProperty<boolean>;
  beneficiaries?: Array<Beneficiary>;
  installments?: Array<Installment>;
};

export type AmountValidationRules = {
  required: string;
  invalidValue: string;
  positive: string;
  zero: string;
  totalMismatch: string;
};

export type DateValidationRules = {
  required: string | boolean;
  pastDate: string;
};

export type BeneficiaryValidationRules = {
  amount: AmountValidationRules;
  entityName: {
    required: string;
  };
  taxCode: {
    required: string;
    invalid: string;
  };
  remittance: {
    required: string;
  };
  paymentFields: {
    required: string;
  };
  taxonomyCode: {
    required: string;
  };
};

export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export type TypedValidator = FieldValidator & {
  isValid?: (value: string) => ValidationResult;
};

export type ValidationContext = {
  totalAmount?: string;
  isDateRequired?: boolean;
  requiredDateMessage?: string;
};

export type BeneficiaryFieldValidators = {
  validateBeneficiaryTaxCode: (value: string) => string | undefined;
  validateRemittance: (value: string) => string | undefined;
  validateIBAN: (value: string) => string | undefined;
  validatePostalIban: (value: string) => string | undefined;
  validatePaymentMethod: (
    iban: string,
    postalAccount: string
  ) => string | undefined;
};

export type BeneficiaryValidationContext<T extends FieldValues> = {
  id: string;
  index: number;
  isSubmitted: boolean;
  wasSubmittedRef: React.RefObject<boolean>;
  existingBeneficiaries: Record<string, boolean>;
  errors: FieldErrors<T>;
  fieldNamePrefix: string;
  getValues: UseFormGetValues<T>;
  t: (key: string) => string;
};

export type BaseHookProps<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly isSubmitted: boolean;
  readonly getValues: UseFormGetValues<T>;
  readonly trigger: UseFormTrigger<T>;
};

export type BeneficiaryManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    readonly fieldNamePrefix: FieldArrayPath<T>;
    readonly totalAmount: string;
    readonly setValue?: UseFormSetValue<T>;
    readonly onToggleMultibeneficiary?: (value: boolean) => void;
    readonly onBeneficiariesChange?: (
      summary: Array<{
        id: string;
        index: number;
        isNew: boolean;
        dati: Record<string, unknown>;
      }>
    ) => void;
    readonly isInsideInstallment?: boolean;
    readonly installmentIndex?: number;
  };

export type InstallmentManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    readonly fieldNamePrefix: FieldArrayPath<T>;
    readonly setValue: UseFormSetValue<T>;
    readonly flagMandatoryDueDate?: boolean;
    readonly onInstallmentsChange?: (
      installments: Array<Installment>,
      totalAmount: string
    ) => void;
  };

export type InstallmentBeneficiaryManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    readonly index: number;
    readonly installmentsFieldNamePrefix: string;
    readonly setValue: UseFormSetValue<T>;
    readonly onToggleMultibeneficiary?: (value: boolean) => void;
  };

export type BeneficiaryManagementResult = {
  fields: Array<Record<string, unknown>>;
  validators: Record<string, unknown>;
  fieldValidators: Record<string, unknown>;
  MAX_BENEFICIARIES: number;
  existingBeneficiaries: Record<string, boolean>;
  wasSubmittedRef: { current: boolean };
  isInitializingRef: { current: boolean };
  addBeneficiary: () => void;
  removeBeneficiary: (index: number) => void;
  resetAllBeneficiaries: () => void;
  updateAmountValidations: () => void;
  getBeneficiaryPath: <U extends FieldValues>(
    index: number,
    field?: string
  ) => Path<U>;
};

export type InstallmentManagementResult = {
  fields: Array<Record<string, unknown>>;
  validators: InstallmentValidators;
  existingInstallments: Record<string, boolean>;
  MIN_INSTALLMENTS: number;
  MAX_INSTALLMENTS: number;
  wasSubmittedRef: { current: boolean };
  isInitializingRef: { current: boolean };
  addInstallment: () => void;
  removeInstallment: (index: number) => void;
  calculateTotalAmount: () => string;
  getInstallmentsData: () => Array<Installment>;
};

export type InstallmentBeneficiaryManagementResult =
  BeneficiaryManagementResult & {
    isMultibeneficiary: boolean;
    toggleMultibeneficiary: (value: boolean) => void;
    validateBeneficiaryAmounts: () => void;
    handleInstallmentAmountChange: (value: string) => void;
    validatePaymentFields: () => void;
  };
