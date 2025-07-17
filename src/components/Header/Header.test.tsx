import { useNavigate } from 'react-router';
import { Header } from './index';
import { Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { PageRoutes } from '../../routes';
import { setUserInfo } from '../../store/UserInfoStore';

//   state: {
//     userInfo: {
//       userId: 'userId',
//       familyName: 'Polo',
//       name: 'Marco'
//     },
//     organizations: [
//       {
//         organizationId: 1,
//         orgLogo: 'logo.png',
//         orgName: 'Org 1',
//         operatorRole: OperatorRoleEnum.ROLE_ADMIN,
//         ipaCode: 'ipaCode',
//         orgFiscalCode: 'XXXXXXX',
//         flagNotifyIo: false,
//         flagNotifyOutcomePush: false,
//         flagPaymentNotification: false
//       }
//     ]
//   }
// }));

// // Mock dependencies
// vi.mock('../../store/GlobalStore', async (importOriginal) => {
//   const actual = await importOriginal();
//   return {
//     ...(actual as any),
//     useStore: mockStore
//   };
// });

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
      mappedExternalUserId: 'mappedExternalUserId'
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
    expect(screen.getByText('I tuoi dati')).toBeInTheDocument();
    expect(screen.getByText('Esci')).toBeInTheDocument();
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
    fireEvent.click(screen.getByText('Esci'));

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
    fireEvent.click(screen.getByText('I tuoi dati'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
