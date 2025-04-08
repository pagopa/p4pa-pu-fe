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
  // Nota: questa validazione controlla solo il formato, non implementa
  // l'algoritmo di checksum per la verifica completa
  return piva.length === 11 && /^\d{11}$/.test(piva);
};

/**
 * Valida un codice fiscale o una partita IVA in base al tipo di soggetto
 * @param value - Codice fiscale/P.IVA da validare
 * @param subjectType - Tipo di soggetto ('fisica' per persone fisiche o 'giuridica' per aziende/enti)
 * @returns true se il codice è valido per il tipo specificato, altrimenti una stringa con il codice errore
 */
export const validateTaxCode = (
  value: string,
  subjectType: string
): ValidationErrorCode | boolean => {
  // Se il valore è vuoto o null, restituisce un codice di errore di campo obbligatorio
  if (!value) return ValidationErrorCode.REQUIRED;

  // Normalizza il valore: rimuove gli spazi e converte in maiuscolo
  const normalizedValue = value.replace(/\s/g, '').toUpperCase();

  // CASO 1: Persona fisica
  if (subjectType === 'fisica') {
    // Per le persone fisiche deve essere un codice fiscale valido
    if (!isValidCodiceFiscale(normalizedValue)) {
      // Se non è valido, restituisce un codice di errore specifico
      return ValidationErrorCode.INVALID_CF;
    }
  }
  // CASO 2: Persona giuridica (azienda/ente)
  else if (subjectType === 'giuridica') {
    // Per le persone giuridiche verifica il formato della partita IVA
    if (normalizedValue.length === 11) {
      // Se ha 11 caratteri, verifica che sia una P.IVA valida
      if (!isValidPartitaIVA(normalizedValue)) {
        return ValidationErrorCode.INVALID_VAT;
      }
    } else {
      // Se non ha 11 caratteri, restituisce un errore di P.IVA non valida
      return ValidationErrorCode.INVALID_VAT;
    }
  }

  // Se tutte le verifiche sono passate, restituisce true (validazione superata)
  return true;
};
