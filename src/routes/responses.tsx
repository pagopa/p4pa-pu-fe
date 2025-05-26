import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
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
        path: 'success/:category',
        element: <SuccessPage />,
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
