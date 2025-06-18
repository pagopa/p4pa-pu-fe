export type RouteHandleObject = {
  backButton?: boolean;
  backButtonText?: string;
  backButtonFunction?: () => void;
  hideBreadcrumbs?: boolean;
  /** this property is used in Breadcrumbs Component.
   * When it's true the breadcumb element is hidden by the breadcumbs path */
  hideBreadcrumbElement?: boolean;
  sidebar: { visible?: boolean };
  custom?: boolean;
};
