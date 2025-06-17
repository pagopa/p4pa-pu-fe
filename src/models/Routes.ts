export type RouteHandleObject = {
  backButton?: boolean;
  backButtonText?: string; // Chiave di traduzione per il testo del pulsante (es. 'commons.back' per "Indietro" o 'commons.exit' per "Esci")
  backButtonFunction?: () => void;
  hideBreadcrumbs?: boolean;
  /** this property is used in Breadcrumbs Component.
   * When it's true the breadcumb element is hidden by the breadcumbs path */
  hideBreadcrumbElement?: boolean;
  sidebar: { visible?: boolean };
  custom?: boolean;
};
