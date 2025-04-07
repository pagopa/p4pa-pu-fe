// Funzioni di validazione per codice fiscale e partita IVA

/**
 * Verifica se un codice fiscale italiano è valido
 * @param cf - Codice fiscale da validare
 * @returns true se il codice fiscale è valido, false altrimenti
 */
export const isValidCodiceFiscale = (cf: string): boolean => {
  if (!cf) return false;

  // Normalizza codice fiscale: rimuovi spazi e converti in maiuscolo
  cf = cf.replace(/\s/g, '').toUpperCase();

  // Controllo lunghezza
  if (cf.length !== 16) return false;

  // Controllo formato: 6 lettere, 2 numeri, 1 lettera, 2 numeri, 1 lettera, 3 numeri, 1 lettera
  const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  return regex.test(cf);
};

/**
 * Verifica se una partita IVA italiana è valida
 * @param piva - Partita IVA da validare
 * @returns true se la partita IVA è valida, false altrimenti
 */
export const isValidPartitaIVA = (piva: string): boolean => {
  if (!piva) return false;

  // Normalizza: rimuovi spazi
  piva = piva.replace(/\s/g, '');

  // Controlla lunghezza e formato (11 cifre)
  return piva.length === 11 && /^\d{11}$/.test(piva);
};

/**
 * Valida un codice fiscale in base al tipo di soggetto
 * @param value - Codice fiscale/P.IVA da validare
 * @param subjectType - Tipo di soggetto ('fisica' o 'giuridica')
 * @returns true se il codice è valido per il tipo specificato, false altrimenti
 */
export const validateTaxCode = (
  value: string,
  subjectType: string
): boolean | string => {
  if (!value) return 'common.required';

  const normalizedValue = value.replace(/\s/g, '').toUpperCase();

  if (subjectType === 'fisica') {
    if (!isValidCodiceFiscale(normalizedValue)) {
      return 'debtPositionCreateWizard.step2.taxCode.invalid';
    }
  } else if (subjectType === 'giuridica') {
    // Per le persone giuridiche verifica che sia una P.IVA valida
    // o un codice fiscale valido (alcune aziende hanno CF di 16 caratteri)
    if (normalizedValue.length === 11) {
      if (!isValidPartitaIVA(normalizedValue)) {
        return 'debtPositionCreateWizard.step2.taxCode.invalidVAT';
      }
    } else if (normalizedValue.length === 16) {
      if (!isValidCodiceFiscale(normalizedValue)) {
        return 'debtPositionCreateWizard.step2.taxCode.invalid';
      }
    } else {
      return 'debtPositionCreateWizard.step2.taxCode.invalidFormat';
    }
  }

  return true;
};
