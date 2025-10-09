import { Controller, Control, Path, FieldValues } from 'react-hook-form';
import { FormComponent, SelectProps } from '../FormComponent';
import { SelectOptions } from './_Select';
import { UseQueryResult } from '@tanstack/react-query';
import { ErrorMessage } from './ErrorMessage';
import utils from '../../utils';
import { useTranslation } from 'react-i18next';

export type _ControlledSelectProps<T extends FieldValues> = SelectProps & {
  name: Path<T>;
  control: Control<T>;
  label: string;
  fetchFn?: () => UseQueryResult<SelectOptions>;
  disabled?: boolean;
  required?: boolean;
};

export const _ControlledSelect = <T extends FieldValues>({
  name,
  control,
  fetchFn,
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
      render={({ field: { ref, value, ...field }, fieldState }) => {
        // value here is the entire option object or undefined
        // Make sure default to null if undefined for Autocomplete compatibility
        const selectedOption = value ?? undefined;

        return (
          <FormComponent.Select
            forwardRef={ref}
            id={name}
            required={props.required}
            disabled={
              props.disabled ||
              optionsResult.isLoading ||
              !optionsResult.data?.length
            }
            options={optionsResult.data ?? []}
            value={selectedOption}
            error={!!fieldState.error}
            helperText={
              fieldState.error && (
                <ErrorMessage messageKey={fieldState.error?.message} />
              )
            }
            {...field}
            {...props}
          />
        );
      }}
    />
  );
};
