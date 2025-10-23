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
  required = false,
  baseTranslationKey
}: ServiceSelectorProps) => {
  const { t } = useTranslation();
  const { errors } = useFormState({ control });

  const { options, isLoading, hasError, noOptionsAvailable } =
    useServiceSelectorState(query);

  const enhancedOptions = [
    {
      value: NO_SERVICE_VALUE,
      label: t(`${baseTranslationKey}.none`)
    },
    ...options
  ];

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
      helperText={hasValidationError ? translatedErrorMessage : ''}
      disabled={isLoading || noOptionsAvailable}
      options={enhancedOptions}
      error={hasError || hasValidationError}
      required={required}
    />
  );
};
