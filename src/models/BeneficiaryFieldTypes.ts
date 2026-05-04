import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormTrigger
} from 'react-hook-form';
import { BeneficiaryValidationContext } from '../utils/BeneficiaryFieldHelpers';

// Props comuni per i componenti del campo beneficiario
export type BeneficiaryFieldsProps<T extends FieldValues> = {
  /** Control del form */
  control: Control<T>;
  /** Indice del beneficiario nella lista */
  index: number;
  /** Contesto di validazione */
  validationContext: BeneficiaryValidationContext<T>;
  /** Prefisso del campo per accedere ai campi dei beneficiari */
  fieldNamePrefix: string;
  /** Flag che indica se il campo è disabilitato */
  disabled: boolean;
  /** Funzione per ottenere i valori del form */
  getValues: UseFormGetValues<T>;
  /** Funzione per attivare la validazione */
  trigger: UseFormTrigger<T>;
  /** Errori del form */
  errors: FieldErrors<T>;
  /** Validatori per il beneficiario */
  validators: ReturnType<
    typeof import('../utils/fieldValidation').createBeneficiaryValidators
  >;
  /** Validatori di campo */
  fieldValidators: ReturnType<
    typeof import('../utils/fieldValidation').createBeneficiaryFieldValidators
  >;
  /** Array di campi del form array */
  fields: Array<Record<'id', string>>;
  /** Funzione per la traduzione */
  t: (key: string) => string;
};
