import {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
  useWatch
} from 'react-hook-form';
import { useEffect, useRef } from 'react';

export type FormDependencies<T extends FieldValues> = {
  form: UseFormReturn<T>;
  fieldOrder: Array<Path<T>>;
  disabled?: boolean;
};

/**
 * Hook to manage dependent form fields with automatic reset behavior
 *
 * When a field changes, all subsequent fields in the fieldOrder array are reset to undefined.
 * Also generates unique keys for each field to force component remount when values change.
 *
 * @param form - react-hook-form instance
 * @param fieldOrder - Array of field names in dependency order
 * @param disabled - If true, disables the reset behavior
 *
 * @returns Object with keys for each field to control component remounting
 **/
export const useFormDependencies = <T extends FieldValues>({
  form,
  fieldOrder,
  disabled = false
}: FormDependencies<T>) => {
  const { control } = form;

  // Watch all dependent fields in order
  const values = useWatch({ control, name: fieldOrder });

  // Store previous values to detect which field changed
  // Initialized as null to distinguish first render from subsequent updates
  const prevValuesRef = useRef<typeof values | null>(null);

  // Track if this is the very first effect run
  const isFirstEffectRun = useRef(true);

  useEffect(() => {
    // Skip reset logic if disabled
    if (disabled) {
      prevValuesRef.current = values;
      isFirstEffectRun.current = false;
      return;
    }

    // Skip reset on first effect run to allow form initialization with defaultValues
    // This prevents resetting dependent fields when loading from URL
    if (isFirstEffectRun.current || prevValuesRef.current === null) {
      prevValuesRef.current = values;
      isFirstEffectRun.current = false;
      return;
    }

    const prev = prevValuesRef.current;
    const changedIndex = values.findIndex((v, i) => v !== prev?.[i]);

    if (changedIndex >= 0) {
      const fieldsToReset = fieldOrder.slice(changedIndex + 1);
      // Reset dependent fields to undefined instead of empty string
      // This prevents type mismatch issues with Select components
      // that expect FilterFieldValue or undefined, not empty strings
      fieldsToReset.forEach((fieldName) => {
        // Reset value without triggering validation
        form.setValue(fieldName, undefined as PathValue<T, Path<T>>, {
          shouldDirty: false,
          shouldValidate: false
        });
        // Clear any errors present on the field
        form.clearErrors(fieldName);
      });
    }
    prevValuesRef.current = values;
  }, [values, form, fieldOrder, disabled]);

  const keys = fieldOrder.reduce<Record<string, string>>(
    (acc, fieldName, index) => {
      // Generate keys based on current values
      // When value changes, key changes, causing component remount and proper reset
      return {
        ...acc,
        [fieldName]: `${fieldName}-${values[index] ?? index}`
      };
    },
    {}
  ) as Record<Path<T>, string>;

  return { keys };
};
