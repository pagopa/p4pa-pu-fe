import { Outlet } from 'react-router';
import { SuperAdminRouteGuard } from '../components/RouteGuard/RouteGuard';
import Organizations from './Organizations/Organizations';
import OrganizationDetail from './Organizations/OrganizationDetail';

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
      },
      {
        id: 'ORGANIZATIONS_DETAIL',
        element: <OrganizationDetail />,
        path: `:organizationId?`,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        }
      }
    ]
  }
];
