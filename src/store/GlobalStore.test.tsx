import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { STATE } from './types';
import { setOrganizationId } from './OrganizationIdStore';
import { setUserInfo } from './UserInfoStore';
import { useStore, StoreProvider } from './GlobalStore';
import 'vitest-dom/extend-expect';

vi.mock('./OrganizationIdStore', () => ({
  setOrganizationId: vi.fn(),
  organizationIdState: { state: { value: null } }
}));

vi.mock('./UserInfoStore', () => ({
  setUserInfo: vi.fn(),
  userInfoState: { state: { value: null } }
}));

vi.mock('./ConfigFeStore', () => ({
  configFeState: { value: null }
}));

vi.mock('./AppStateStore', () => ({
  appState: { value: { loading: false } }
}));

describe('StoreContext', () => {
  afterEach(() => {
    // Restore the original console.error after the test
    vi.restoreAllMocks();
  });

  it('should provide combined state to children', () => {
    const TestComponent = () => {
      const { state } = useStore();
      return <div data-testid="app-state">{JSON.stringify(state)}</div>;
    };

    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );

    const appStateElement = screen.getByTestId('app-state');
    expect(appStateElement).toHaveTextContent(
      JSON.stringify({
        [STATE.APP_STATE]: { loading: false },
        [STATE.CONFIG_FE]: null,
        [STATE.ORGANIZATION_ID]: null,
        [STATE.USER_INFO]: null
      })
    );
  });

  it('should call setOrganizationId when setting ORGANIZATION_ID', () => {
    const TestComponent = () => {
      const { setState } = useStore();
      setState(STATE.ORGANIZATION_ID, { id: 'org123' });
      return null;
    };

    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );

    expect(setOrganizationId).toHaveBeenCalledWith({ id: 'org123' });
  });

  it('should call setUserInfo when setting USER_INFO', () => {
    const TestComponent = () => {
      const { setState } = useStore();
      setState(STATE.USER_INFO, { name: 'John Doe' });
      return null;
    };

    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );

    expect(setUserInfo).toHaveBeenCalledWith({ name: 'John Doe' });
  });

  it('should throw an error if useStore is used outside of StoreProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const TestComponent = () => {
      useStore();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrowError(
      'useStore must be used within a StoreProvider'
    );
  });
});
