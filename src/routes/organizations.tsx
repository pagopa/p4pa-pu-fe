import { Outlet } from 'react-router';
import { SuperAdminRouteGuard } from '../components/RouteGuard/RouteGuard';
import Organizations from './Organizations/Organizations';

export const organizationsRoutes = [
  {
    id: 'ORGANIZATIONS',
    path: 'organizations/',
    element: (
      <SuperAdminRouteGuard>
        <Outlet />
      </SuperAdminRouteGuard>
    ),
    children: [
      {
        id: 'ORGANIZATIONS_INDEX',
        element: <Organizations />,
        index: true,
        handle: {
          hideBreadcrumbs: true,
          backButton: false
        }
      }
    ]
  }
];
