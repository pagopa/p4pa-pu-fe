import {
  AdminRouteGuard,
  SuperAdminRouteGuard
} from '../components/RouteGuard/RouteGuard';
import { OrganizationDetail } from './Organizations/OrganizationDetail';
import { OrganizationIntegrations } from './Organizations/OrganizationIntegrations';
import OrganizationEditWizard from './Organizations/OrganizationEditWizard/OrganizationEditWizard';
import Organizations from './Organizations/Organizations';
import { SubUnitsList } from './SubUnitsList';
import { SubUnitDetail } from './SubUnitDetail';
import { SubUnitCreate } from './SubUnitCreate';
import { AddIntegration } from './Organizations/AddIntegration';
import { SubunitAssignOperator } from './SubunitAssignOperator';

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
        id: 'ORGANIZATIONS_INTEGRATIONS',
        element: (
          <AdminRouteGuard>
            <OrganizationIntegrations />
          </AdminRouteGuard>
        ),
        path: `:organizationId/integrations`,
        handle: {
          backButton: false,
          hideBreadcrumbs: false,
          custom: true
        }
      },
      {
        id: 'ADD_INTEGRATION',
        element: (
          <AdminRouteGuard>
            <AddIntegration />
          </AdminRouteGuard>
        ),
        path: `:organizationId/integrations/add`,
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
        id: 'EDIT_INTEGRATION',
        element: (
          <AdminRouteGuard>
            <AddIntegration mode="edit" />
          </AdminRouteGuard>
        ),
        path: `:organizationId/integrations/edit/:IntegrationType`,
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
      },
      {
        id: 'ORGANIZATIONS_SUB_UNITS',
        path: `:organizationId/subunits`,
        element: (
          <AdminRouteGuard>
            <SubUnitsList />
          </AdminRouteGuard>
        ),
        handle: {
          backButton: false,
          custom: true
        }
      },
      {
        id: 'SUB_UNIT_DETAIL_PARENT',
        path: `:organizationId/subunits/:subUnitCode/`,
        children: [
          {
            id: 'SUB_UNIT_DETAIL',
            index: true,
            element: (
              <AdminRouteGuard>
                <SubUnitDetail />
              </AdminRouteGuard>
            ),
            handle: {
              backButton: false,
              custom: true
            }
          },
          {
            id: 'SUB_UNIT_DETAIL_ASSIGN_OPERATORS',
            path: `assign-operator`,
            element: (
              <AdminRouteGuard>
                <SubunitAssignOperator />
              </AdminRouteGuard>
            ),
            handle: {
              backButton: true,
              backButtonText: 'commons.exit',
              hideBreadcrumbs: true,
              sidebar: {
                visible: false
              }
            }
          }
        ]
      },
      {
        id: 'SUB_UNIT_CREATE',
        path: `:organizationId/subunits/create`,
        element: (
          <AdminRouteGuard>
            <SubUnitCreate />
          </AdminRouteGuard>
        ),
        handle: {
          backButton: true,
          backButtonText: 'commons.exit',
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        }
      }
    ]
  }
];
