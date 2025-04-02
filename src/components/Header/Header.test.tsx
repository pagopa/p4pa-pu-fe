import { useNavigate } from 'react-router-dom';
import { Header } from './index';
import { Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { useOrganizations } from '../../hooks/useOrganizations';
import { OperatorRoleEnum } from '../../../generated/apiClient';
import { PageRoutes } from '../../App';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('../../hooks/useOrganizations', () => ({
  useOrganizations: vi.fn()
}));

describe('Header component', () => {
  const mockNavigate = vi.fn();
  const mockOnAssistanceClick = vi.fn();
  const mockUseOrganizations = vi.mocked(useOrganizations);

  beforeAll(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  beforeEach(() => {
    // @ts-expect-error mock success
    mockUseOrganizations.mockReturnValue({
      organizations: [
        {
          organizationId: 1,
          orgLogo: 'logo.png',
          orgName: 'Org 1',
          operatorRole: OperatorRoleEnum.ROLE_ADMIN,
          ipaCode: 'ipaCode',
          orgFiscalCode: 'XXXXXXX'
        }
      ],
      isSuccess: true
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
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.HOME);
    });

    mockStorage.mockRestore();
  });
});
