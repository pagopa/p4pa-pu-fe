import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Breadcrumbs';
import config from '../utils/config';
import ResponsesThankyou from './ResponsesThankyou';

const deployPath = config.deployPath;

export const responsesRoutes = [
  {
    id: 'RESPONSES',
    path: `${deployPath}/responses/`,
    element: <Layout />,
    children: [
      {
        id: 'RESPONSES_THANKYOU',
        index: true,
        path: 'thankyou/:category',
        element: <ResponsesThankyou />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false,
          }
        } as RouteHandleObject,
      }
    ]
  }
];