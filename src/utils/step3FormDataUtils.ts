import { UseFormSetValue, FieldValues, Path, PathValue } from 'react-hook-form';
import {
  Step3FormValues,
  convertFormValuesToStep3Data
} from '../models/Step3Schema';
import { Step3Data, Step1Data, Step2Data } from '../models/DebtPositionType';
import type { Installment } from '../models/paymentTypes';

/**
 * Parameters for populating form fields
 */
export type PopulateFormFieldsParams = {
  data: Step3Data;
  setValue: UseFormSetValue<Step3FormValues>;
};

/**
 * Parameters for preparing form data
 */
export type PrepareFormDataParams = {
  values: Step3FormValues;
  syncedInstallments?: Array<Installment>;
  step1Data: Step1Data;
  step2Data: Step2Data;
  setData: (data: Step3Data) => void;
};

/**
 * Result of form population operations
 */
export type PopulationResult = {
  hasPopulatedSomething: boolean;
};

/**
 * Checks if there's actual data to populate in the form (not just empty strings)
 * @param data - Step3 data to check
 * @returns boolean - true if there's actual data to populate
 */
export const hasActualDataToPopulate = (data: Step3Data): boolean => {
  return Boolean(
    (data.paymentObject?.value && data.paymentObject.value.trim() !== '') ||
      (data.paymentOption?.value && data.paymentOption.value.trim() !== '') ||
      (data.amount?.value && data.amount.value.trim() !== '') ||
      (data.dueDate?.value && data.dueDate.value.trim() !== '') ||
      (data.beneficiaries && data.beneficiaries.length > 0) ||
      (data.installments && data.installments.length > 0)
  );
};

/**
 * Populates the basic form fields with available data
 * @param params - Parameters for populating basic fields
 * @returns boolean - true if something was populated
 */
export const populateBasicFields = (
  params: PopulateFormFieldsParams
): boolean => {
  const { data, setValue } = params;
  let hasPopulatedSomething = false;

  if (data.paymentObject?.value && data.paymentObject.value.trim() !== '') {
    setValue('paymentObject.value', data.paymentObject.value);
    hasPopulatedSomething = true;
  }

  if (data.paymentOption?.value && data.paymentOption.value.trim() !== '') {
    setValue('paymentOption.value', data.paymentOption.value);
    hasPopulatedSomething = true;
  }

  if (data.amount?.value && data.amount.value.trim() !== '') {
    setValue('amount.value', data.amount.value);
    hasPopulatedSomething = true;
  }

  return hasPopulatedSomething;
};

/**
 * Populates the due date field converting from string to Date if necessary
 * @param params - Parameters for populating due date field
 * @returns boolean - true if the field was populated
 */
export const populateDueDateField = (
  params: PopulateFormFieldsParams
): boolean => {
  const { data, setValue } = params;

  if (data.dueDate?.value && data.dueDate.value.trim() !== '') {
    const dateValue =
      typeof data.dueDate.value === 'string'
        ? new Date(data.dueDate.value)
        : data.dueDate.value;
    setValue('dueDate.value', dateValue);
    return true;
  }
  return false;
};

/**
 * Populates the multi-beneficiary field
 * @param params - Parameters for populating multi-beneficiary field
 * @returns boolean - true if the field was populated
 */
export const populateMultiBeneficiaryField = (
  params: PopulateFormFieldsParams
): boolean => {
  const { data, setValue } = params;

  if (data.isMultibeneficiary?.value != null) {
    setValue('isMultibeneficiary.value', data.isMultibeneficiary.value);
    return true;
  }
  return false;
};

/**
 * Populates the beneficiaries and installments fields
 * @param params - Parameters for populating complex fields
 * @returns boolean - true if something was populated
 */
export const populateComplexFields = (
  params: PopulateFormFieldsParams
): boolean => {
  const { data, setValue } = params;
  let hasPopulatedSomething = false;

  if (data.beneficiaries && data.beneficiaries.length > 0) {
    setValue('beneficiaries', data.beneficiaries);
    hasPopulatedSomething = true;
  }

  if (data.installments && data.installments.length > 0) {
    setValue('installments', data.installments);
    hasPopulatedSomething = true;
  }

  return hasPopulatedSomething;
};

/**
 * Populates all form fields with available data
 * Combines all population functions for convenience
 * @param params - Parameters for populating all fields
 * @returns PopulationResult - Result with information about what was populated
 */
export const populateAllFormFields = (
  params: PopulateFormFieldsParams
): PopulationResult => {
  const basicFieldsPopulated = populateBasicFields(params);
  const dueDatePopulated = populateDueDateField(params);
  const multiBeneficiaryPopulated = populateMultiBeneficiaryField(params);
  const complexFieldsPopulated = populateComplexFields(params);

  const hasPopulatedSomething =
    basicFieldsPopulated ||
    dueDatePopulated ||
    multiBeneficiaryPopulated ||
    complexFieldsPopulated;

  return { hasPopulatedSomething };
};

/**
 * Transforms form values to Step3Data and updates component state
 * @param params - Parameters for preparing form data
 * @returns Step3Data - Transformed form data
 */
export const prepareFormData = (params: PrepareFormDataParams): Step3Data => {
  const { values, syncedInstallments, step1Data, step2Data, setData } = params;

  // Transform form values using conversion function
  const formattedValues: Step3Data = convertFormValuesToStep3Data({
    ...values,
    // Use syncedInstallments if available from validation
    ...(syncedInstallments && { installments: syncedInstallments }),
    flagMandatoryDueDate: values.flagMandatoryDueDate,
    step1Data,
    step2Data
  });

  setData(formattedValues);
  return formattedValues;
};

/**
 * Utility function to check if a string value is not empty
 * @param value - String value to check
 * @returns boolean - true if the value is not empty
 */
export const isNotEmptyString = (value?: string): boolean => {
  return Boolean(value && value.trim() !== '');
};

/**
 * Utility function to safely set form field value if data exists
 * @param setValue - React Hook Form setValue function
 * @param fieldName - Name of the field to set
 * @param value - Value to set
 * @param condition - Optional condition to check before setting
 * @returns boolean - true if the value was set
 */
export const safeSetValue = <T extends FieldValues, P extends Path<T>>(
  setValue: UseFormSetValue<T>,
  fieldName: P,
  value: PathValue<T, P>,
  condition = true
): boolean => {
  if (condition && value != null) {
    setValue(fieldName, value);
    return true;
  }
  return false;
};
