import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
import GenericErrorPage from './UtilityPages/genericError';
import SuccessPage from './UtilityPages/success';

const deployPath = config.deployPath;

export const responsesRoutes = [
  {
    id: 'RESPONSES',
    path: `${deployPath}/`,
    element: <Layout />,
    children: [
      {
        id: 'RESPONSES_SUCCESS',
        index: true,
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
        index: true,
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
    ]
  }
];
