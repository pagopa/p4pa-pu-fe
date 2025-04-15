import { Controller, FieldValues } from 'react-hook-form';
import { Grid } from '@mui/material';
import {
  EntityNameField,
  AmountField,
  TaxCodeField,
  IBANField,
  PostalAccountField,
  TaxonomyCodeField
} from './BeneficiaryFieldComponents';
import { buildBeneficiaryFieldPath } from '../../../../utils/BeneficiaryFieldHelpers';
import { BeneficiaryFieldsProps } from '../../../../models/BeneficiaryFieldTypes';

/**
 * Componente per il gruppo di informazioni anagrafiche del beneficiario
 */
export function BeneficiaryIdentityFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
  t
}: Readonly<
  Pick<
    BeneficiaryFieldsProps<T>,
    | 'control'
    | 'index'
    | 'fieldNamePrefix'
    | 'validationContext'
    | 'disabled'
    | 't'
  >
>) {
  return (
    <>
      <Grid item xs={12}>
        <Controller
          name={buildBeneficiaryFieldPath<T, 'entityName'>(
            fieldNamePrefix,
            index,
            'entityName'
          )}
          control={control}
          rules={{
            required: t(
              'debtPositionCreateWizard.step3.beneficiary.entityName.required'
            )
          }}
          render={({ field }) => (
            <EntityNameField
              field={field}
              t={t}
              disabled={disabled}
              context={validationContext}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name={buildBeneficiaryFieldPath<T, 'taxCode'>(
            fieldNamePrefix,
            index,
            'taxCode'
          )}
          control={control}
          rules={{
            required: t(
              'debtPositionCreateWizard.step3.beneficiary.taxCode.required'
            ),
            validate: {
              taxCodeFormat: (value) =>
                import('../../../../utils/fieldValidation')
                  .then((module) => module.createBeneficiaryFieldValidators(t))
                  .then((validators) =>
                    validators.validateBeneficiaryTaxCode(value)
                  )
            }
          }}
          render={({ field }) => (
            <TaxCodeField
              field={field}
              t={t}
              disabled={disabled}
              context={validationContext}
            />
          )}
        />
      </Grid>
    </>
  );
}

/**
 * Componente per il gruppo di informazioni economiche del beneficiario
 */
export function BeneficiaryAmountFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
  fields,
  validators,
  trigger,
  t
}: Readonly<
  Pick<
    BeneficiaryFieldsProps<T>,
    | 'control'
    | 'index'
    | 'fieldNamePrefix'
    | 'validationContext'
    | 'disabled'
    | 'fields'
    | 'validators'
    | 'trigger'
    | 't'
  >
>) {
  return (
    <Grid item xs={12}>
      <Controller
        name={buildBeneficiaryFieldPath<T, 'amount'>(
          fieldNamePrefix,
          index,
          'amount'
        )}
        control={control}
        rules={{
          required: t(
            'debtPositionCreateWizard.step3.beneficiary.amount.required'
          ),
          validate: {
            isValidAmount: (value) => {
              return validators.validateSingleBeneficiary(value, fields.length);
            },
            totalAmount: () => {
              return validators.validateTotalAmount();
            }
          }
        }}
        render={({ field, fieldState }) => {
          // Se c'è un errore nel campo, prendiamo nota
          const hasAmountError = !!fieldState.error;

          return (
            <AmountField
              field={field}
              t={t}
              disabled={disabled}
              context={{
                ...validationContext,
                // Forziamo isSubmitted a true se c'è un errore, anche se il form non è stato sottomesso
                isSubmitted: validationContext.isSubmitted || hasAmountError
              }}
              index={index}
              fields={fields}
              trigger={trigger}
              fieldNamePrefix={fieldNamePrefix}
            />
          );
        }}
      />
    </Grid>
  );
}

/**
 * Componente per il gruppo di informazioni di pagamento del beneficiario
 */
export function BeneficiaryPaymentFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
  getValues,
  trigger,
  errors,
  fieldValidators,
  t
}: Readonly<
  Pick<
    BeneficiaryFieldsProps<T>,
    | 'control'
    | 'index'
    | 'fieldNamePrefix'
    | 'validationContext'
    | 'disabled'
    | 'getValues'
    | 'trigger'
    | 'errors'
    | 'fieldValidators'
    | 't'
  >
>) {
  return (
    <>
      <Grid item xs={12}>
        <Controller
          name={buildBeneficiaryFieldPath<T, 'iban'>(
            fieldNamePrefix,
            index,
            'iban'
          )}
          control={control}
          rules={{
            validate: {
              ibanFormat: fieldValidators.validateIBAN,
              paymentMethod: (value) => {
                const postalAccount = getValues(
                  buildBeneficiaryFieldPath<T, 'postalAccount'>(
                    fieldNamePrefix,
                    index,
                    'postalAccount'
                  )
                );

                const result = fieldValidators.validatePaymentMethod(
                  value,
                  postalAccount
                );

                // Se uno dei due è valorizzato, non mostrare errori
                if (
                  (value && value.trim() !== '') ||
                  (postalAccount && postalAccount.trim() !== '')
                ) {
                  return undefined;
                }

                return result;
              }
            }
          }}
          render={({ field }) => (
            <IBANField
              field={field}
              t={t}
              disabled={disabled}
              context={validationContext}
              index={index}
              trigger={trigger}
              fieldNamePrefix={fieldNamePrefix}
              errors={errors}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name={buildBeneficiaryFieldPath<T, 'postalAccount'>(
            fieldNamePrefix,
            index,
            'postalAccount'
          )}
          control={control}
          rules={{
            validate: {
              postalAccountFormat: fieldValidators.validatePostalAccount,
              paymentMethod: (value) => {
                const iban = getValues(
                  buildBeneficiaryFieldPath<T, 'iban'>(
                    fieldNamePrefix,
                    index,
                    'iban'
                  )
                );

                const result = fieldValidators.validatePaymentMethod(
                  iban,
                  value
                );

                // Se uno dei due è valorizzato, non mostrare errori
                if (
                  (value && value.trim() !== '') ||
                  (iban && iban.trim() !== '')
                ) {
                  return undefined;
                }

                return result;
              }
            }
          }}
          render={({ field }) => (
            <PostalAccountField
              field={field}
              t={t}
              disabled={disabled}
              context={validationContext}
              index={index}
              trigger={trigger}
              fieldNamePrefix={fieldNamePrefix}
              errors={errors}
            />
          )}
        />
      </Grid>
    </>
  );
}

/**
 * Componente per il gruppo di informazioni di classificazione del beneficiario
 */
export function BeneficiaryClassificationFields<T extends FieldValues>({
  control,
  index,
  fieldNamePrefix,
  validationContext,
  disabled,
  t
}: Readonly<
  Pick<
    BeneficiaryFieldsProps<T>,
    | 'control'
    | 'index'
    | 'fieldNamePrefix'
    | 'validationContext'
    | 'disabled'
    | 't'
  >
>) {
  return (
    <Grid item xs={12}>
      <Controller
        name={buildBeneficiaryFieldPath<T, 'taxonomyCode'>(
          fieldNamePrefix,
          index,
          'taxonomyCode'
        )}
        control={control}
        rules={{
          required: t(
            'debtPositionCreateWizard.step3.beneficiary.taxonomyCode.required'
          )
        }}
        render={({ field }) => (
          <TaxonomyCodeField
            field={field}
            t={t}
            disabled={disabled}
            context={validationContext}
          />
        )}
      />
    </Grid>
  );
}
