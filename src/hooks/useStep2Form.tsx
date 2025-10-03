/**
 * @description Custom hook for Step2 form management
 * @summary Handles form initialization, validation, edit mode sync, and business logic for Step2AddDebtor
 */
import { useEffect, useRef } from 'react';
import { useForm, Resolver, FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { TFunction } from 'i18next';
import { Step2Data } from '../models/DebtPositionType';
import { SubjectType } from '../utils/fieldValidation';

type Step2DataField = keyof Step2Data;

type FieldErrorValue = {
  type: string;
  message: string;
};

type NestedFieldErrors<T> = {
  [K in keyof T]?: {
    value?: FieldErrorValue;
  };
};

export type UseStep2FormProps = {
  data: Step2Data;
  setData: (data: Step2Data) => void;
  isEditing?: boolean;
  schema: z.ZodTypeAny;
  t: TFunction;
};

export type UseStep2FormResult = {
  control: ReturnType<typeof useForm<Step2Data>>['control'];
  handleSubmit: ReturnType<typeof useForm<Step2Data>>['handleSubmit'];
  watch: ReturnType<typeof useForm<Step2Data>>['watch'];
  errors: ReturnType<typeof useForm<Step2Data>>['formState']['errors'];
  isSubmitted: boolean;
  trigger: ReturnType<typeof useForm<Step2Data>>['trigger'];
  clearErrors: ReturnType<typeof useForm<Step2Data>>['clearErrors'];
  setValue: ReturnType<typeof useForm<Step2Data>>['setValue'];
  reset: ReturnType<typeof useForm<Step2Data>>['reset'];
};

/**
 * Custom hook for Step2AddDebtor form management
 * Handles all form-related logic: validation, initialization, edit mode sync
 */
export const useStep2Form = ({
  data,
  setData,
  isEditing = false,
  schema,
  t
}: UseStep2FormProps): UseStep2FormResult => {
  const hasInitializedRef = useRef(false);

  // Initialize default values for empty fields
  useEffect(() => {
    // Don't initialize defaults in edit mode - data comes from API
    if (!isEditing) {
      initializeDefaultValues();
    }
  }, [data, setData, isEditing]);

  const initializeDefaultValues = () => {
    let hasUpdates = false;
    const updatedData = { ...data };

    // Initialize string fields with empty value
    const stringFields = [
      'address',
      'civicNumber',
      'zipCode',
      'province',
      'city'
    ] as const;

    stringFields.forEach((field) => {
      if (!updatedData[field]) {
        updatedData[field] = { value: '', readonly: false };
        hasUpdates = true;
      }
    });

    // Initialize country with 'IT' default
    if (!updatedData.country) {
      updatedData.country = { value: 'IT', readonly: false };
      hasUpdates = true;
    } else if (updatedData.country.value === '') {
      updatedData.country.value = 'IT';
      hasUpdates = true;
    }

    // Initialize anonymousSubject ONLY if completely missing
    if (updatedData.anonymousSubject === undefined) {
      updatedData.anonymousSubject = { value: false, readonly: false };
      hasUpdates = true;
    }

    if (hasUpdates) {
      setData(updatedData);
    }
  };

  // Create field error object
  const createFieldError = (message: string): FieldErrorValue => ({
    type: 'validation',
    message
  });

  // Customize error messages based on subject type
  const customizeErrorMessage = (
    fieldName: Step2DataField,
    message: string,
    subjectType?: string
  ): string => {
    // Customize taxCode errors for BUSINESS type (VAT instead of Tax Code)
    if (fieldName === 'taxCode' && subjectType === SubjectType.BUSINESS) {
      if (message === t('debtPositionCreateWizard.step2.taxCode.required')) {
        return t('debtPositionCreateWizard.step2.vat.required');
      }
    }

    // Customize fullName errors for BUSINESS type (Company Name instead of Full Name)
    if (fieldName === 'fullName' && subjectType === SubjectType.BUSINESS) {
      if (message === t('debtPositionCreateWizard.step2.fullName.required')) {
        return t('debtPositionCreateWizard.step2.companyName.required');
      }
      if (
        message === t('debtPositionCreateWizard.step2.fullName.minTwoWords')
      ) {
        return t('debtPositionCreateWizard.step2.companyName.minTwoWords');
      }
    }

    return message;
  };

  // Transform Zod errors to React Hook Form format
  const transformZodErrors = (
    zodError: z.ZodError,
    values: Step2Data
  ): NestedFieldErrors<Step2Data> => {
    return zodError.errors.reduce(
      (formErrors: NestedFieldErrors<Step2Data>, error) => {
        const path = error.path;

        if (path.length >= 2 && path[1] === 'value') {
          const fieldName = path[0] as Step2DataField;

          const customMessage = customizeErrorMessage(
            fieldName,
            error.message,
            values.subjectType?.value
          );

          formErrors[fieldName] = {
            value: createFieldError(customMessage)
          };
        }

        return formErrors;
      },
      {}
    );
  };

  // Create Zod resolver for React Hook Form
  const zodFormResolver: Resolver<Step2Data> = async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values, errors: {} };
    }

    return {
      values: {},
      errors: transformZodErrors(result.error, values) as FieldErrors<Step2Data>
    };
  };

  // Initialize form with React Hook Form
  const {
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitted },
    trigger,
    clearErrors,
    setValue,
    reset
  } = useForm<Step2Data>({
    defaultValues: {
      ...data,
      country: {
        ...data.country,
        value: data.country?.value || 'IT'
      },
      anonymousSubject: {
        ...data.anonymousSubject,
        value: data.anonymousSubject?.value ?? false
      }
    },
    resolver: zodFormResolver,
    mode: 'onChange'
  });

  // Reset form values when edit data is loaded - only once
  useEffect(() => {
    if (
      isEditing &&
      data &&
      data.taxCode?.value &&
      !hasInitializedRef.current
    ) {
      hasInitializedRef.current = true;
      const resetData = {
        ...data,
        country: {
          ...data.country,
          value: data.country?.value || 'IT'
        },
        anonymousSubject: {
          ...data.anonymousSubject,
          value: data.anonymousSubject?.value ?? false
        }
      };
      reset(resetData, { keepDefaultValues: false });

      // Force setValue for anonymousSubject to ensure it's updated
      setValue('anonymousSubject.value', data.anonymousSubject?.value ?? false, {
        shouldValidate: false
      });
    }
  }, [isEditing, data?.taxCode?.value, data?.anonymousSubject?.value]);

  return {
    control,
    handleSubmit,
    watch,
    errors,
    isSubmitted,
    trigger,
    clearErrors,
    setValue,
    reset
  };
};
