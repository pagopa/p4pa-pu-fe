import { RouteHandleObject } from '../models/Routes';
import GenericErrorPage from './UtilityPages/genericError';
import SuccessPage from './UtilityPages/success';

export const responsesRoutes = [
  {
    id: 'RESPONSES_SUCCESS',
    path: 'success',
    element: <SuccessPage />,
    handle: {
      backButton: false,
      hideBreadcrumbs: true,
      sidebar: {
        visible: false
      }
    } as RouteHandleObject
  },
  {
    id: 'RESPONSES_ERROR',
    path: 'error',
    element: <GenericErrorPage />,
    handle: {
      backButton: false,
      hideBreadcrumbs: true,
      sidebar: {
        visible: false
      }
    } as RouteHandleObject
  }
];
