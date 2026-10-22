import type {
  Control,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormTrigger
} from 'react-hook-form';
import type { BeneficiaryValidationContext } from '../utils/BeneficiaryFieldHelpers';
import type {
  createBeneficiaryFieldValidators,
  createBeneficiaryValidators
} from '../utils/fieldValidation';

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
  validators: ReturnType<typeof createBeneficiaryValidators>;
  /** Validatori di campo */
  fieldValidators: ReturnType<typeof createBeneficiaryFieldValidators>;
  /** Array di campi del form array */
  fields: Array<Record<'id', string>>;
  /** Funzione per la traduzione */
  t: (key: string) => string;
};
