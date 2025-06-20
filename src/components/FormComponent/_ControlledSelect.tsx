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
};

export const _ControlledSelect = <T extends FieldValues>({
  name,
  control,
  fetchFn,
  ...props
}: _ControlledSelectProps<T>) => {
  const { t } = useTranslation();
  const options = fetchFn
    ? fetchFn()
    : { data: props.options, isLoading: false, isError: false };

  if (fetchFn && options.isError)
    utils.notify.emit(t('commons.genericError'), 'error');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, ...field }, fieldState }) => (
        <FormComponent.Select
          forwardRef={ref}
          id={name}
          required
          disabled={
            props.disabled || options.isLoading || !options.data?.length
          }
          options={options?.data}
          error={!!fieldState.error}
          helperText={
            fieldState.error && (
              <ErrorMessage messageKey={fieldState.error?.message} />
            )
          }
          {...field}
          {...props}
        />
      )}
    />
  );
};
