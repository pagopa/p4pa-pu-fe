// Funzioni di validazione per codice fiscale e partita IVA

import { ValidationErrorCode } from '../store/types';

/**
 * Verifica se un codice fiscale italiano è valido
 * @param cf - Codice fiscale da validare
 * @returns true se il codice fiscale è valido, false altrimenti
 */
export const isValidCodiceFiscale = (cf: string): boolean => {
  // Se il codice fiscale è vuoto o null, restituisce falso immediatamente
  if (!cf) return false;
  // Normalizza il codice fiscale:
  // - Rimuove tutti gli spazi usando un'espressione regolare (/\s/g)
  // - Converte tutto in maiuscolo per uniformità
  cf = cf.replace(/\s/g, '').toUpperCase();

  // Verifica che la lunghezza sia esattamente 16 caratteri (standard CF italiano)
  if (cf.length !== 16) return false;

  // Controlla che il formato rispetti lo schema del codice fiscale italiano:
  // - Prime 6 posizioni: lettere (cognome e nome)
  // - Posizioni 7-8: numeri (anno di nascita)
  // - Posizione 9: lettera (mese di nascita)
  // - Posizioni 10-11: numeri (giorno di nascita + codice genere)
  // - Posizione 12: lettera (codice catastale comune/stato estero)
  // - Posizioni 13-15: numeri (codice individuale)
  // - Posizione 16: lettera (carattere di controllo)
  const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

  // Verifica il formato usando l'espressione regolare e restituisce il risultato
  return regex.test(cf);
};

/**
 * Verifica se una partita IVA italiana è valida
 * @param piva - Partita IVA da validare
 * @returns true se la partita IVA è valida, false altrimenti
 */
export const isValidPartitaIVA = (piva: string): boolean => {
  // Se la partita IVA è vuota o null, restituisce falso immediatamente
  if (!piva) return false;

  // Normalizza la partita IVA rimuovendo tutti gli spazi
  piva = piva.replace(/\s/g, '');

  // Verifica che:
  // 1. La lunghezza sia esattamente 11 caratteri (standard P.IVA italiana)
  // 2. Sia composta solo da cifre numeriche (0-9)
  // Nota: questa validazione controlla solo il formato
  return piva.length === 11 && /^\d{11}$/.test(piva);
};

export const validateTaxCode = (
  value: string,
  subjectType: string
): ValidationErrorCode => {
  if (!value) return ValidationErrorCode.REQUIRED;

  const normalizedValue = value.replace(/\s/g, '').toUpperCase();

  switch (subjectType) {
    case 'fisica':
      if (!isValidCodiceFiscale(normalizedValue)) {
        return ValidationErrorCode.INVALID_CF;
      }
      break;
    case 'giuridica':
      if (!isValidPartitaIVA(normalizedValue)) {
        return ValidationErrorCode.INVALID_VAT;
      }
      break;
    default:
      return ValidationErrorCode.INVALID_CF;
  }

  return ValidationErrorCode.VALID;
};
