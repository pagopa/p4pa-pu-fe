import { BredcrumbItem } from '../components/Breadcrumbs/Breadcrumbs';

export type AppState = {
  loading: boolean;
  customBreadcrumbsItems: Array<BredcrumbItem>;
  ready: boolean;
  announcement: string;
};
