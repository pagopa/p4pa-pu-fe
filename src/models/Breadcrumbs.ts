export type BreadcrumbPath = {
  elements?: Array<BreadcrumbElement>;
  routeName?: string;
};

export type BreadcrumbElement = {
  name: string;
  fontWeight?: number;
  color?: string;
  href?: string;
};

export type RouteHandleObject = {
  backButton?: boolean;
  backButtonText?: string;
  backButtonFunction?: () => void;
  hideBreadcrumbs?: boolean;
  sidebar: { visible?: boolean };
};
