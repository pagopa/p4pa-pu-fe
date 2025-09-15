import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { StoreProvider } from '../../store/GlobalStore';
import { OperatorRole } from '../../../generated/data-contracts';
import { Theme } from '../../utils/theme';
import { MemoryRouter } from 'react-router';
import { setOperatorRole } from '../../store/OperatorRoleStore';
import utils from '../../utils';

const renderSidebar = () =>
  render(
    <StoreProvider>
      <MemoryRouter>
        <Theme>
          <Sidebar />
        </Theme>
      </MemoryRouter>
    </StoreProvider>
  );

describe('Sidebar component', () => {
  it('should not render backoffice section when the role is operator', () => {
    setOperatorRole(OperatorRole.ROLE_OPER);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.BACKOFFICE')).toBeNull();
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
    // PLEASE UPDATE WITH THE DEFINTIVE MENU ITEMS NAME
    expect(screen.queryByText('PLACEHOLDER MENU ITEM 1')).toBeDefined();
    expect(screen.queryByText('PLACEHOLDER MENU ITEM 2')).toBeDefined();
  });

  it('should render backoffice section with a limited sub menu items when the role is admin', () => {
    setOperatorRole(OperatorRole.ROLE_ADMIN);
    vi.spyOn(utils.roles, 'useIsSuperAdmin').mockImplementation(() => false);

    renderSidebar();

    expect(screen.queryByText('commons.routes.BACKOFFICE')).toBeDefined();
    expect(screen.queryByText('commons.routes.BACKOFFICE_TAXONOMY')).toBeNull();
    expect(screen.queryByText('commons.routes.BACKOFFICE_EVENTS')).toBeNull();
    // PLEASE UPDATE WITH THE DEFINTIVE MENU ITEMS NAME
    expect(screen.queryByText('PLACEHOLDER MENU ITEM 1')).toBeDefined();
    expect(screen.queryByText('PLACEHOLDER MENU ITEM 2')).toBeDefined();
  });
});
