export type RouteHandleObject = {
  backButton?: boolean;
  backButtonText?: string; // Chiave di traduzione per il testo del pulsante (es. 'commons.back' per "Indietro" o 'commons.exit' per "Esci")
  backButtonFunction?: () => void;
  hideBreadcrumbs?: boolean;
  sidebar: { visible?: boolean };
  custom?: boolean;
};
