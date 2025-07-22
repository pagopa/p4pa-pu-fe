import { Control, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormComponent } from '../../../../../components/FormComponent';
import { DebtTypeOrgForm } from '../../../types';
import { useServiceSelectorState } from '../../../hooks/useServiceSelectorState';
import { UseQueryResult } from '@tanstack/react-query';
import { OrgSilServiceExtendedDTO } from '../.../../../../../../../generated/data-contracts';

type ServiceSelectorProps = {
  control: Control<DebtTypeOrgForm>;
  name: keyof DebtTypeOrgForm;
  labelKey: string;
  query: UseQueryResult<Array<OrgSilServiceExtendedDTO>, Error>;
  edit?: boolean;
  required?: boolean;
  baseTranslationKey: string;
  allowNone?: boolean;
};

export const NO_SERVICE_VALUE = undefined;

export const ServiceSelector = ({
  control,
  name,
  labelKey,
  query,
  edit = false,
  required = false,
  baseTranslationKey,
  allowNone = false
}: ServiceSelectorProps) => {
  const { t } = useTranslation();
  const { errors } = useFormState({ control });

  const {
    options,
    isLoading,
    hasError,
    noOptionsAvailable,
    placeholderKey,
    helperTextKey
  } = useServiceSelectorState(query, edit, baseTranslationKey);

  const enhancedOptions = allowNone
    ? [
        {
          value: NO_SERVICE_VALUE,
          label: t(`${baseTranslationKey}.none`)
        },
        ...options
      ]
    : options;

  const fieldError = errors[name];
  const hasValidationError = !!fieldError;

  const translatedErrorMessage =
    hasValidationError && fieldError?.message
      ? t(fieldError.message as string)
      : undefined;

  return (
    <FormComponent.ControlledSelect
      name={name}
      control={control}
      label={t(labelKey)}
      helperText={
        hasValidationError ? translatedErrorMessage : t(helperTextKey)
      }
      placeholder={t(placeholderKey)}
      disabled={isLoading || noOptionsAvailable}
      options={enhancedOptions}
      error={hasError || hasValidationError}
      required={required}
    />
  );
};
