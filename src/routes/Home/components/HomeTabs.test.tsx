import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { HomeTabs } from './HomeTabs';
import { TABS, tabsConfigProps, USER_PROFILES } from '../models';

vi.mock('../../../utils', () => ({
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
const mockIuvMutate = vi.fn();
vi.mock('../../../api/home', () => ({
  useDashboardByIuv: () => ({ mutateAsync: mockIuvMutate }),
  useDashboardByFiscalCode: () => ({ mutateAsync: vi.fn() }),
  useDashboardByIuf: () => ({ mutateAsync: mockIufMutate })
}));

describe('Home tabs component', () => {
  const mockSessionStorage = {
    getItem: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
  };

  it('submits IUV search and calls useDashboardByIuv with the input value', async () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    const mockTabsConfig: Array<tabsConfigProps> = [
      {
        id: TABS.IUV,
        label: 'home.tabs.IUV.label',
        icon: <span data-testid="icon" />,
        searchLabel: 'home.tabs.IUV.fieldLabel',
        searchName: 'iuv'
      },
      {
        id: TABS.FC,
        label: 'home.tabs.FC.label',
        icon: <span data-testid="icon" />,
        searchLabel: 'home.tabs.FC.fieldLabel',
        searchName: 'cf'
      },
      {
        id: TABS.IUF,
        label: 'home.tabs.IUF.label',
        icon: <span data-testid="icon" />,
        searchLabel: 'home.tabs.IUF.fieldLabel',
        searchName: 'iuf'
      }
    ];

    render(
      <HomeTabs
        tabsHandleChange={vi.fn()}
        currentTab={TABS.IUV}
        tabsAvailableForProfile={vi.fn().mockReturnValue(mockTabsConfig)}
        profileSelected={USER_PROFILES.OM}
        defaultUserProfile={USER_PROFILES.DP}
        searchHandler={mockIuvMutate}
        error={false}
      />
    );

    expect(screen.getByTestId('home-tab-IUF')).toBeInTheDocument();
    expect(screen.getByTestId('home-tab-FC')).toBeInTheDocument();
    expect(screen.getByTestId('home-tab-IUV')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('home-tab-IUF'));

    const panel = screen.getByTestId('home-tabpanel-IUV');
    const input = within(panel).getByRole('textbox');
    await userEvent.type(input, 'IUV123');

    await userEvent.click(screen.getByTestId('home-form-btn-IUV'));
    await waitFor(() => {
      expect(mockIuvMutate).toHaveBeenCalled();
    });
  });
});
