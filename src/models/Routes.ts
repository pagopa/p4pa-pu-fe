export type RouteHandleObject = {
  backButton?: boolean;
  backButtonText?: string;
  backButtonFunction?: () => void;
  hideBreadcrumbs?: boolean;
  sidebar: { visible?: boolean };
  custom?: boolean;
};
