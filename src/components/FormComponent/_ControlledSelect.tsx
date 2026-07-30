import {
  Controller,
  Control,
  Path,
  FieldValues,
  RegisterOptions
} from 'react-hook-form';
import { _Select, _SelectProps, SelectOptions } from './_Select';
import { UseQueryResult } from '@tanstack/react-query';
import { ErrorMessage } from './ErrorMessage';
import utils from '../../utils';
import { useTranslation } from 'react-i18next';
import { FilterFieldValue } from '../../models/Filters';

export type _ControlledSelectProps<T extends FieldValues> = _SelectProps & {
  name: Path<T>;
  control: Control<T>;
  label: string;
  fetchFn?: () => UseQueryResult<SelectOptions>;
  disabled?: boolean;
  required?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
};

export const _ControlledSelect = <T extends FieldValues>({
  name,
  control,
  fetchFn,
  rules,
  ...props
}: _ControlledSelectProps<T>) => {
  const { t } = useTranslation();

  // Fetch options either from fetchFn or props.options fallback
  const optionsResult = fetchFn
    ? fetchFn()
    : { data: props.options, isLoading: false, isError: false };

  if (fetchFn && optionsResult.isError)
    utils.notify.emit(t('commons.genericError'), 'error');

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { ref, value, onChange, onBlur }, fieldState }) => {
        const options = optionsResult.data ?? [];

        //ensure value exists in options to prevent MUI Autocomplete errors
        // If value is not in options (e.g., during field reset), use undefined
        const valueInOptions =
          value !== undefined &&
          value !== null &&
          options.some((opt) => opt.value === value);

        const safeValue =
          valueInOptions || value === undefined || value === null
            ? value
            : undefined;

        // Handle field value changes
        const handleChange = (newValue: FilterFieldValue) => {
          // Update field value through react-hook-form Controller
          onChange(newValue);
        };

        return (
          <_Select
            forwardRef={ref}
            id={name}
            required={props.required}
            disabled={
              props.disabled || optionsResult.isLoading || !options.length
            }
            options={options}
            value={safeValue}
            onChange={handleChange}
            onBlur={onBlur}
            error={!!fieldState.error}
            helperText={
              fieldState.error && (
                <ErrorMessage messageKey={fieldState.error?.message} />
              )
            }
            {...props}
          />
        );
      }}
    />
  );
};
