import {
  AdminRouteGuard,
  SuperAdminRouteGuard
} from '../components/RouteGuard/RouteGuard';
import Organizations from './Organizations/Organizations';
import OrganizationDetail from './Organizations/OrganizationDetail';
import OrganizationEditWizard from './Organizations/OrganizationEditWizard/OrganizationEditWizard';

export const organizationsRoutes = [
  {
    id: 'ORGANIZATIONS',
    path: 'organizations/',
    children: [
      {
        id: 'ORGANIZATIONS_INDEX',
        element: (
          <SuperAdminRouteGuard>
            <Organizations />
          </SuperAdminRouteGuard>
        ),
        index: true,
        handle: {
          hideBreadcrumbs: true,
          backButton: false
        }
      },
      {
        id: 'ORGANIZATIONS_EDIT',
        element: (
          <AdminRouteGuard>
            <OrganizationEditWizard />
          </AdminRouteGuard>
        ),
        path: `:organizationId/edit`,
        handle: {
          backButton: true,
          backButtonText: 'commons.exit',
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        }
      },
      {
        id: 'ORGANIZATIONS_DETAIL',
        element: (
          <AdminRouteGuard>
            <OrganizationDetail />
          </AdminRouteGuard>
        ),
        path: `:organizationId?`,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        }
      }
    ]
  }
];
