import { useNavigate } from 'react-router';
import { Header } from './index';
import { Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { PageRoutes } from '../../routes';
import { setUserInfo } from '../../store/UserInfoStore';
import { organizationsState } from '../../store/OrganizationsStore';
import {
  OperatorRole,
  OrganizationDTO,
  OrganizationStatus
} from '../../../generated/data-contracts';

// Mock dependencies
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('../../store/OrganizationIdStore', () => ({
  organizationIdState: {
    state: { value: 123 }
  },
  setOrganizationId: vi.fn()
}));

vi.mock('@preact/signals-react/runtime', () => ({
  useSignals: vi.fn()
}));

describe('Header component', () => {
  const mockNavigate = vi.fn();
  const mockOnAssistanceClick = vi.fn();

  beforeAll(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    setUserInfo({
      userId: 'userId',
      familyName: 'Polo',
      name: 'Marco',
      fiscalCode: 'XXXXXXX',
      canManageUsers: false,
      issuer: 'Issuer',
      organizations: [],
      brokerId: 1,
      mappedExternalUserId: 'mappedExternalUserId',
      traceId: 'test-trace-id',
      _type: 'UserInfoDTO'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render as expected', () => {
    render(<Header />);
  });

  it('submenu elements should be visible after clicking user element', () => {
    render(<Header onAssistanceClick={mockOnAssistanceClick} />);

    fireEvent.click(screen.getByText('Marco Polo'));
    expect(
      screen.getByText('commons.userActions.yourdata')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.userActions.logout')).toBeInTheDocument();
  });

  it('should call onAssistanceClick when assistance button is clicked', () => {
    const onAssistanceClick = vi.fn();
    render(<Header onAssistanceClick={onAssistanceClick} />);
    fireEvent.click(screen.getByText('Assistenza'));
    expect(onAssistanceClick).toHaveBeenCalledTimes(1);
  });

  it('should clear session storage and navigate to home when "Esci" is clicked', async () => {
    const mockStorage = vi.spyOn(Storage.prototype, 'clear');

    render(<Header />);

    fireEvent.click(screen.getByText('Marco Polo'));
    fireEvent.click(screen.getByText('commons.userActions.logout'));

    await waitFor(() => {
      expect(mockStorage).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.LOGGED_OUT);
    });

    mockStorage.mockRestore();
  });

  it('should not render HeaderProduct when organizations data is empty', () => {
    const { container } = render(<Header />);

    expect(container.innerHTML).not.toBe('');
    expect(screen.queryByText('Piattaforma Unitaria')).not.toBeInTheDocument();
  });

  it('should call onDocumentationClick when documentation button is clicked', () => {
    const onDocumentationClick = vi.fn();
    render(<Header onDocumentationClick={onDocumentationClick} />);

    fireEvent.click(screen.getByText('Manuale operativo'));
    expect(onDocumentationClick).toHaveBeenCalledTimes(1);
  });

  it('should navigate to home page when clicking on user data menu item', () => {
    render(<Header />);

    fireEvent.click(screen.getByText('Marco Polo'));
    fireEvent.click(screen.getByText('commons.userActions.yourdata'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('does not render canceled organizations in HeaderProduct', () => {
    // Set organizations including one canceled and one active
    organizationsState.value = [
      {
        organizationId: 1,
        orgName: 'Active Org',
        status: OrganizationStatus.ACTIVE,
        operatorRole: OperatorRole.ROLE_ADMIN,
        brokerId: 1,
        orgLogo: 'logo1.png'
      },
      {
        organizationId: 2,
        orgName: 'Canceled Org',
        status: OrganizationStatus.CANCELLED,
        operatorRole: OperatorRole.ROLE_ADMIN,
        brokerId: 1,
        orgLogo: 'logo2.png'
      }
    ] as Array<OrganizationDTO>;

    render(<Header />);

    // Active org should be rendered
    expect(screen.getByText('Active Org')).toBeInTheDocument();

    // Canceled org should be excluded
    expect(screen.queryByText('Canceled Org')).not.toBeInTheDocument();
  });

  it('does not render organizations of different brokers', () => {
    organizationsState.value = [
      {
        organizationId: 1,
        orgName: 'My broker Org',
        status: OrganizationStatus.ACTIVE,
        operatorRole: OperatorRole.ROLE_ADMIN,
        brokerId: 1, // userInfo brokerId
        orgLogo: 'logo1.png'
      },
      {
        organizationId: 2,
        orgName: 'Another broker Org',
        status: OrganizationStatus.ACTIVE,
        operatorRole: OperatorRole.ROLE_ADMIN,
        brokerId: 99,
        orgLogo: 'logo2.png'
      }
    ] as Array<OrganizationDTO>;

    render(<Header />);

    expect(screen.getByText('My broker Org')).toBeInTheDocument();

    expect(screen.queryByText('Another broker Org')).not.toBeInTheDocument();
  });
});
