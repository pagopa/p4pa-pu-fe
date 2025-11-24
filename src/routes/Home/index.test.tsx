import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import utils from '../../utils';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render, screen, waitFor } from '../../__tests__/renderers';
import { setUserInfo } from '../../store/UserInfoStore';
import Home from '.';
import { USER_PROFILES } from './models';

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

const mockIufMutate = vi.fn();
vi.mock('../../api/home', () => ({
  useDashboardByIuv: () => ({ mutateAsync: vi.fn() }),
  useDashboardByFiscalCode: () => ({ mutateAsync: vi.fn() }),
  useDashboardByIuf: () => ({ mutateAsync: mockIufMutate })
}));

const mockGetUserProfilePreference = vi.fn();
const mockSaveUserProfilePreference = vi.fn();

vi.mock('../../utils/userPreferences', () => ({
  getUserProfilePreference: (userId: string) =>
    mockGetUserProfilePreference(userId),
  saveUserProfilePreference: (userId: string, preference: string) =>
    mockSaveUserProfilePreference(userId, preference)
}));

describe('Home page', () => {
  const mockSessionStorage = {
    getItem: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
  };

  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        const newStore = { ...store };
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete newStore[key];
        store = newStore;
      },
      clear: () => {
        store = {};
      }
    };
  })();

  const user = {
    userId: 'userId',
    familyName: 'Polo',
    name: 'Marco',
    fiscalCode: 'XXXXXXX',
    canManageUsers: false,
    issuer: 'Issuer',
    organizations: [],
    mappedExternalUserId: 'mappedExternalUserId',
    traceId: 'test-trace-id',
    _type: 'UserInfoDTO'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserProfilePreference.mockReturnValue(null);
    mockSaveUserProfilePreference.mockReturnValue(true);
    mockLocalStorage.clear();

    i18nTestSetup({
      home: {
        opening: 'Ciao, {{user}}',
        tabs: {
          IUV: { label: 'IUV', fieldLabel: 'IUV' },
          IUF: { label: 'Rendicontazione', fieldLabel: 'IUF' },
          FC: { label: 'Codice Fiscale', fieldLabel: 'CF' }
        },
        viewAs: 'Visualizza come',
        chooseWidget: {
          title: 'Scegli profilo',
          message: 'Seleziona un profilo',
          closingText: 'Testo finale',
          profiles: {
            [USER_PROFILES.DP]: {
              title: 'Delegato di Pagamento',
              description: 'Descrizione DP'
            },
            [USER_PROFILES.TM]: {
              title: 'Tesoriere',
              description: 'Descrizione TM'
            },
            [USER_PROFILES.OM]: {
              title: 'Responsabile Ufficio',
              description: 'Descrizione OM'
            }
          }
        },
        cta: 'Nuova posizione debitoria'
      },
      commons: {
        search: 'Cerca',
        routes: { HOME: 'Panoramica' },
        continue: 'Continua',
        close: 'Chiudi'
      }
    });
    setUserInfo(user);

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  const renderHome = () => {
    return render(<Home />);
  };

  it('renders Home with the name of the user', () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    renderHome();

    expect(screen.getByTestId('main-title')).toHaveTextContent(
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

  describe('User profile preference management', () => {
    it('shows dialog when no preference is saved', async () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      mockGetUserProfilePreference.mockReturnValue(null);

      renderHome();

      await waitFor(() => {
        const dialog = screen.getByTestId('home-choose-widget');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('loads saved preference and closes dialog on mount', async () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      mockGetUserProfilePreference.mockReturnValue(USER_PROFILES.TM);

      renderHome();

      await waitFor(() => {
        expect(mockGetUserProfilePreference).toHaveBeenCalledWith(
          user.mappedExternalUserId
        );
      });

      expect(mockGetUserProfilePreference).toHaveBeenCalled();
    });

    it('saves preference when clicking Close without existing preference', async () => {
      const userEvt = userEvent.setup();
      mockSessionStorage.getItem.mockReturnValue(null);
      mockGetUserProfilePreference.mockReturnValue(null);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-choose-widget')).toBeInTheDocument();
      });

      const tmRadio = screen.getByLabelText('Tesoriere');
      await userEvt.click(tmRadio);

      const closeButton = screen.getByText('Chiudi');
      await userEvt.click(closeButton);

      await waitFor(() => {
        expect(mockSaveUserProfilePreference).toHaveBeenCalledWith(
          user.mappedExternalUserId,
          USER_PROFILES.TM
        );
      });
    });

    it('does not change preference when clicking Close with existing preference', async () => {
      const userEvt = userEvent.setup();
      mockSessionStorage.getItem.mockReturnValue(null);
      mockGetUserProfilePreference.mockReturnValue(USER_PROFILES.DP);

      renderHome();

      await waitFor(() => {
        expect(mockGetUserProfilePreference).toHaveBeenCalled();
      });

      const chooseWidgetBtn = screen.getByTestId('home-choose-widget-btn');
      await userEvt.click(chooseWidgetBtn);

      await waitFor(() => {
        expect(screen.getByTestId('home-choose-widget')).toBeInTheDocument();
      });

      const tmRadio = screen.getByLabelText('Tesoriere');
      await userEvt.click(tmRadio);

      mockSaveUserProfilePreference.mockClear();
      mockGetUserProfilePreference.mockReturnValue(USER_PROFILES.DP);

      const closeButton = screen.getByText('Chiudi');
      await userEvt.click(closeButton);

      await waitFor(() => {
        expect(mockGetUserProfilePreference).toHaveBeenCalled();
        expect(mockSaveUserProfilePreference).not.toHaveBeenCalled();
      });
    });

    it('saves preference and updates UI when clicking Continue', async () => {
      const userEvt = userEvent.setup();
      mockSessionStorage.getItem.mockReturnValue(null);
      mockGetUserProfilePreference.mockReturnValue(null);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-choose-widget')).toBeInTheDocument();
      });

      const omRadio = screen.getByLabelText('Responsabile Ufficio');
      await userEvt.click(omRadio);

      const continueButton = screen.getByText('Continua');
      await userEvt.click(continueButton);

      await waitFor(() => {
        expect(mockSaveUserProfilePreference).toHaveBeenCalledWith(
          user.mappedExternalUserId,
          USER_PROFILES.OM
        );
      });
    });

    it('does not show dialog when preference exists on mount', async () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      mockGetUserProfilePreference.mockReturnValue(USER_PROFILES.DP);

      renderHome();

      await waitFor(() => {
        expect(mockGetUserProfilePreference).toHaveBeenCalledWith(
          user.mappedExternalUserId
        );
      });

      expect(mockGetUserProfilePreference).toHaveBeenCalled();
    });
  });

  describe('Edge cases - missing mappedExternalUserId', () => {
    it('handles dialog close when mappedExternalUserId is undefined', async () => {
      const userEvt = userEvent.setup();
      mockSessionStorage.getItem.mockReturnValue(null);
      mockGetUserProfilePreference.mockReturnValue(null);

      const userWithoutMappedId = {
        ...user,
        mappedExternalUserId: undefined
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUserInfo(userWithoutMappedId as any);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-choose-widget')).toBeInTheDocument();
      });

      const tmRadio = screen.getByLabelText('Tesoriere');
      await userEvt.click(tmRadio);

      const closeButton = screen.getByText('Chiudi');
      await userEvt.click(closeButton);

      await waitFor(() => {
        expect(mockSaveUserProfilePreference).not.toHaveBeenCalled();
      });

      await waitFor(() => {
        const dialog = screen.queryByTestId('home-choose-widget');
        expect(dialog).not.toBeInTheDocument();
      });
    });

    it('handles profile confirmation when mappedExternalUserId is undefined', async () => {
      const userEvt = userEvent.setup();
      mockSessionStorage.getItem.mockReturnValue(null);
      mockGetUserProfilePreference.mockReturnValue(null);

      const userWithoutMappedId = {
        ...user,
        mappedExternalUserId: undefined
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUserInfo(userWithoutMappedId as any);

      renderHome();

      await waitFor(() => {
        expect(screen.getByTestId('home-choose-widget')).toBeInTheDocument();
      });

      const omRadio = screen.getByLabelText('Responsabile Ufficio');
      await userEvt.click(omRadio);

      const continueButton = screen.getByText('Continua');
      await userEvt.click(continueButton);

      await waitFor(() => {
        expect(mockSaveUserProfilePreference).not.toHaveBeenCalled();
      });

      await waitFor(() => {
        const dialog = screen.queryByTestId('home-choose-widget');
        expect(dialog).not.toBeInTheDocument();
      });
    });
  });
});
