import { z } from 'zod';
import { TFunction } from 'i18next';
import { SubjectType } from '../utils/fieldValidation';
import {
  isValidCodiceFiscale,
  isValidPartitaIVA
} from '../utils/fieldValidation';

/**
 * Definizione dello schema per il tipo di campo con value e readonly
 */
function createFieldSchema<T>(
  valueSchema: z.ZodType<T>,
  readonlySchema: z.ZodType<boolean> = z.boolean()
): z.ZodObject<{
  value: z.ZodType<T>;
  readonly: z.ZodType<boolean>;
}> {
  return z.object({
    value: valueSchema,
    readonly: readonlySchema
  });
}

/**
 * Schema di validazione Zod per il Step2AddDebtor (struttura piatta)
 * Manteniamo questo schema per compatibilità con il codice esistente
 * @param t - Funzione di traduzione per i messaggi di errore
 * @returns Schema Zod per la validazione del form
 */
export const createStep2AddDebtorSchema = (t: TFunction) => {
  // Schema di base
  const schema = z.object({
    'subjectType.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.subjectType.required')),

    'taxCode.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.taxCode.required')),

    'fullName.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.fullName.required')),

    'address.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.address.required')),

    'civicNumber.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.civicNumber.required')),

    'zipCode.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.zipCode.required')),

    'country.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.country.required')),

    'province.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.province.required')),

    'city.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.city.required'))
  });

  // Validazione per persone fisiche
  const individualSchema = schema.refine(
    (data) => {
      if (data['subjectType.value'] !== SubjectType.INDIVIDUAL) return true;
      const taxCode = data['taxCode.value'];
      return isValidCodiceFiscale(taxCode) || isValidPartitaIVA(taxCode);
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.invalid'),
      path: ['taxCode.value']
    }
  );

  // Validazione per aziende
  const businessSchema = individualSchema.refine(
    (data) => {
      if (data['subjectType.value'] !== SubjectType.BUSINESS) return true;
      const taxCode = data['taxCode.value'];
      return isValidPartitaIVA(taxCode);
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.invalidVAT'),
      path: ['taxCode.value']
    }
  );

  // Validazione per fullName: due parole solo per persone fisiche
  const fullNameSchema = businessSchema.refine(
    (data) => {
      const fullName = data['fullName.value'];
      const trimmed = fullName.trim();
      const subjectType = data['subjectType.value'];

      // Verifica che il nome contenga almeno due parole SOLO per le persone fisiche
      if (subjectType === SubjectType.INDIVIDUAL) {
        return trimmed.split(' ').length >= 2;
      }

      // Per le aziende, è già validato che non sia vuoto dallo schema base
      return true;
    },
    {
      // Il messaggio di errore sarà poi personalizzato nel resolver in base al tipo di soggetto
      message: t('debtPositionCreateWizard.step2.fullName.minTwoWords'),
      path: ['fullName.value']
    }
  );

  // Validazione per indirizzo
  const addressSchema = fullNameSchema.refine(
    () => {
      // L'indirizzo è già validato per non essere vuoto nello schema base
      // Possiamo aggiungere ulteriori validazioni se necessario in futuro
      return true;
    },
    {
      message: t('debtPositionCreateWizard.step2.address.required'),
      path: ['address.value']
    }
  );

  // Validazione per zipCode
  return addressSchema.refine(
    (data) => {
      const zipCode = data['zipCode.value'];
      const country = data['country.value'];

      if (country === 'IT' || !country) {
        return /^\d{5}$/.test(zipCode);
      }

      return true;
    },
    {
      message: t('debtPositionCreateWizard.step2.zipCode.error'),
      path: ['zipCode.value']
    }
  );
};

/**
 * Schema di validazione Zod per il Step2AddDebtor con struttura nidificata
 * Questo schema rispecchia esattamente la struttura di Step2Data
 * @param t - Funzione di traduzione per i messaggi di errore
 * @returns Schema Zod per la validazione del form
 */
export const createNestedStep2AddDebtorSchema = (t: TFunction) => {
  // Schemi di base per ogni campo
  const subjectTypeSchema = createFieldSchema(
    z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.subjectType.required'))
  );

  const taxCodeSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.taxCode.required'))
  );

  const fullNameSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.fullName.required'))
  );

  const addressSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.address.required'))
  );

  const civicNumberSchema = createFieldSchema(
    z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.civicNumber.required'))
  );

  const zipCodeSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.zipCode.required'))
  );

  const countrySchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.country.required'))
  );

  const provinceSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.province.required'))
  );

  const citySchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.city.required'))
  );

  // Schema di base per l'intero oggetto
  const schema = z.object({
    subjectType: subjectTypeSchema,
    taxCode: taxCodeSchema,
    fullName: fullNameSchema,
    address: addressSchema,
    civicNumber: civicNumberSchema,
    zipCode: zipCodeSchema,
    country: countrySchema,
    province: provinceSchema,
    city: citySchema
  });

  // Validazione per persone fisiche
  const individualSchema = schema.refine(
    (data) => {
      if (data.subjectType.value !== SubjectType.INDIVIDUAL) return true;
      const taxCode = data.taxCode.value;
      return isValidCodiceFiscale(taxCode) || isValidPartitaIVA(taxCode);
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.invalid'),
      path: ['taxCode', 'value']
    }
  );

  // Validazione per aziende
  const businessSchema = individualSchema.refine(
    (data) => {
      if (data.subjectType.value !== SubjectType.BUSINESS) return true;
      const taxCode = data.taxCode.value;
      return isValidPartitaIVA(taxCode);
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.invalidVAT'),
      path: ['taxCode', 'value']
    }
  );

  // Validazione per fullName: due parole solo per persone fisiche
  const fullNameValidationSchema = businessSchema.refine(
    (data) => {
      const fullName = data.fullName.value;
      const trimmed = fullName.trim();
      const subjectType = data.subjectType.value;

      // Verifica che il nome contenga almeno due parole SOLO per le persone fisiche
      if (subjectType === SubjectType.INDIVIDUAL) {
        return trimmed.split(' ').length >= 2;
      }

      // Per le aziende, è già validato che non sia vuoto dallo schema base
      return true;
    },
    {
      // Il messaggio di errore sarà poi personalizzato nel resolver in base al tipo di soggetto
      message: t('debtPositionCreateWizard.step2.fullName.minTwoWords'),
      path: ['fullName', 'value']
    }
  );

  // Validazione per zipCode (solo per l'Italia deve essere 5 cifre)
  return fullNameValidationSchema.refine(
    (data) => {
      const zipCode = data.zipCode.value;
      const country = data.country.value;

      if (country === 'IT' || !country) {
        return /^\d{5}$/.test(zipCode);
      }

      return true;
    },
    {
      message: t('debtPositionCreateWizard.step2.zipCode.error'),
      path: ['zipCode', 'value']
    }
  );
};

/**
 * Tipo derivato dallo schema Zod piatto
 */
export type Step2AddDebtorFlatFormValues = z.infer<
  ReturnType<typeof createStep2AddDebtorSchema>
>;

/**
 * Tipo derivato dallo schema Zod nidificato
 */
export type Step2AddDebtorNestedFormValues = z.infer<
  ReturnType<typeof createNestedStep2AddDebtorSchema>
>;
