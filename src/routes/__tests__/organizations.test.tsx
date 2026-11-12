import { describe, expect, it, vi } from 'vitest';
import { organizationsRoutes } from '../organizations';

vi.mock('../../components/RouteGuard/RouteGuard', () => ({
  AdminRouteGuard: () => null,
  SuperAdminRouteGuard: () => null
}));
vi.mock('../Organizations/OrganizationDetail', () => ({
  OrganizationDetail: () => null
}));
vi.mock('../Organizations/OrganizationIntegrations', () => ({
  OrganizationIntegrations: () => null
}));
vi.mock(
  '../Organizations/OrganizationEditWizard/OrganizationEditWizard',
  () => ({
    default: () => null
  })
);
vi.mock('../Organizations/Organizations', () => ({ default: () => null }));
vi.mock('../Organizations/AddIntegration', () => ({
  AddIntegration: () => null
}));
vi.mock('../Organizations/enums', () => ({
  IntegrationMode: { EDIT: 'EDIT' }
}));
vi.mock('../SubUnits/SubunitAssignOperator', () => ({
  SubunitAssignOperator: () => null
}));
vi.mock('../SubUnits/SubUnitCreate', () => ({ SubUnitCreate: () => null }));
vi.mock('../SubUnits/SubUnitDetail', () => ({ SubUnitDetail: () => null }));
vi.mock('../SubUnits/SubUnitsList', () => ({ SubUnitsList: () => null }));

describe('organizationsRoutes', () => {
  it('defines the organization and subunit routes', () => {
    expect(organizationsRoutes).toMatchObject([
      {
        id: 'ORGANIZATIONS',
        path: 'organizations/',
        children: [
          { id: 'ORGANIZATIONS_INDEX', index: true },
          { id: 'ORGANIZATIONS_EDIT', path: ':organizationId/edit' },
          {
            id: 'ORGANIZATIONS_INTEGRATIONS',
            path: ':organizationId/integrations'
          },
          { id: 'ADD_INTEGRATION', path: ':organizationId/integrations/add' },
          {
            id: 'EDIT_INTEGRATION',
            path: ':organizationId/integrations/edit/:IntegrationType'
          },
          { id: 'ORGANIZATIONS_DETAIL', path: ':organizationId?' },
          {
            id: 'ORGANIZATIONS_SUB_UNITS',
            path: ':organizationId/subunits'
          },
          {
            id: 'SUB_UNIT_DETAIL_PARENT',
            path: ':organizationId/subunits/:subUnitCode/',
            children: [
              { id: 'SUB_UNIT_DETAIL', index: true },
              {
                id: 'SUB_UNIT_DETAIL_ASSIGN_OPERATORS',
                path: 'assign-operator'
              }
            ]
          },
          { id: 'SUB_UNIT_CREATE', path: ':organizationId/subunits/create' }
        ]
      },
      { id: 'MYORGANIZATION', path: 'organization' }
    ]);
  });
});
