import Home from '.';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import utils from '../../utils';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render, screen } from '../../__tests__/renderers';
import { setUserInfo } from '../../store/UserInfoStore';

vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: '/test'
    }
  }
}));
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('Home page', () => {
  const mockSessionStorage = {
    getItem: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
  };

  const user = {
    userId: 'userId',
    familyName: 'Polo',
    name: 'Marco',
    fiscalCode: 'XXXXXXX',
    canManageUsers: false,
    issuer: 'Issuer',
    organizations: [],
    mappedExternalUserId: 'mappedExternalUserId'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      home: {
        opening: 'Ciao, {{user}}'
      }
    });
    setUserInfo(user);

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });
  });

  const renderHome = () => {
    return render(<Home />);
  };

  it('renders Home with the name of the user', () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    renderHome();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      `${user.name} ${user.familyName}`
    );
  });

  it('handles pending notification when present in sessionStorage', () => {
    const mockNotification = {
      message: 'Test notification message',
      type: 'success'
    };
    mockSessionStorage.getItem.mockReturnValue(
      JSON.stringify(mockNotification)
    );

    renderHome();

    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
      'pendingNotification'
    );
    expect(utils.notify.emit).toHaveBeenCalledWith(
      mockNotification.message,
      mockNotification.type
    );
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      'pendingNotification'
    );
  });

  it('does not emit notification when no pending notification exists', () => {
    mockSessionStorage.getItem.mockReturnValue(null);

    renderHome();

    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
      'pendingNotification'
    );
    expect(utils.notify.emit).not.toHaveBeenCalled();
    expect(mockSessionStorage.removeItem).not.toHaveBeenCalled();
  });

  it('handles different notification types correctly', () => {
    const errorNotification = {
      message: 'Error occurred',
      type: 'error'
    };
    mockSessionStorage.getItem.mockReturnValue(
      JSON.stringify(errorNotification)
    );

    renderHome();

    expect(utils.notify.emit).toHaveBeenCalledWith('Error occurred', 'error');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      'pendingNotification'
    );
  });
});
