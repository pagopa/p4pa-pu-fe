import { screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { OperatorRole } from '../../../generated/core/data-contracts';
import { setOperatorRole } from '../../store/OperatorRoleStore';
import utils from '../../utils';
import { vi } from 'vitest';
import { render } from '../../__tests__/renderers';

const renderSidebar = () => render(<Sidebar />);

describe('Sidebar component', () => {
  it('should not render backoffice section when the role is operator', () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.BACKOFFICE')).toBeNull();
    expect(screen.queryByText('commons.routes.ORGANIZATIONS')).toBeNull();
  });

  it('should render backoffice section with all sub menu items when the role is superAdmin', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => true);

    renderSidebar();

    expect(screen.queryByText('commons.routes.BACKOFFICE')).toBeDefined();

    expect(
      screen.queryByText('commons.routes.BACKOFFICE_TAXONOMY')
    ).toBeDefined();
    expect(
      screen.queryByText('commons.routes.BACKOFFICE_EVENTS')
    ).toBeDefined();
    expect(screen.queryByText('commons.routes.CLIENT_SIL')).toBeDefined();
    expect(screen.queryByText('commons.routes.ORG_SIL_SERVICE')).toBeDefined();

    expect(screen.queryByText('commons.routes.ORGANIZATIONS')).toBeDefined();
  });

  it('should render backoffice section with a limited sub menu items when the role is admin', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.BACKOFFICE')).toBeDefined();

    expect(screen.queryByText('commons.routes.BACKOFFICE_TAXONOMY')).toBeNull();
    expect(screen.queryByText('commons.routes.BACKOFFICE_EVENTS')).toBeNull();
    expect(screen.queryByText('commons.routes.ORGANIZATIONS')).toBeNull();

    expect(screen.queryByText('commons.routes.CLIENT_SIL')).toBeDefined();
    expect(screen.queryByText('commons.routes.ORG_SIL_SERVICE')).toBeDefined();
  });

  it('should render debt types section for admin and superAdmin', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.DEBT_TYPES')).toBeDefined();
    expect(
      screen.queryByText('commons.routes.DEBT_TYPES_DASHBOARD')
    ).toBeDefined();

    expect(screen.queryByText('commons.routes.DEBT_TYPES_CATALOG')).toBeNull();
  });

  it('should render debt types catalog for superAdmin only', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => true);

    renderSidebar();

    expect(screen.queryByText('commons.routes.DEBT_TYPES')).toBeDefined();
    expect(
      screen.queryByText('commons.routes.DEBT_TYPES_DASHBOARD')
    ).toBeDefined();
    expect(
      screen.queryByText('commons.routes.DEBT_TYPES_CATALOG')
    ).toBeDefined();
  });

  it('should render common menu items for all roles', () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.HOME')).toBeDefined();
    expect(screen.queryByText('commons.routes.DEBT_POSITIONS')).toBeDefined();
    expect(screen.queryByText('commons.routes.FLOWS')).toBeDefined();
    expect(screen.queryByText('commons.routes.CLASSIFICATIONS')).toBeDefined();
    expect(screen.queryByText('commons.routes.ASSESSMENT')).toBeDefined();
    expect(screen.queryByText('commons.routes.STATISTICS')).toBeDefined();
  });

  it('should render statistics section for all roles', () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.STATISTICS')).toBeDefined();
  });
});
