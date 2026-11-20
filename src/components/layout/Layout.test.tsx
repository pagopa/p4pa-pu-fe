import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter } from 'react-router';
import type { RouteHandleObject } from '../../models/Routes';
import utils from '../../utils';
import { PageRoutes } from '../../routes';
import { StoreProvider } from '../../store/GlobalStore';
import { Theme } from '../../utils/theme';
import { Layout } from './Layout';

const mocks = vi.hoisted(() => ({ collapsed: false }));

vi.mock('../../hooks/useCollapseMenu', () => ({
  default: () => ({ collapsed: mocks.collapsed })
}));

vi.mock('../../hooks/useFooterData', () => ({
  useFooterData: () => ({})
}));

vi.mock('../Header', () => ({
  Header: ({ onAssistanceClick }: { onAssistanceClick: () => void }) => (
    <button data-testid="header" onClick={onAssistanceClick} />
  )
}));

vi.mock('../Sidebar/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />
}));

vi.mock('../Breadcrumbs/Breadcrumbs', () => ({
  default: () => <div data-testid="breadcrumbs" />
}));

vi.mock('../BackButton', () => ({
  BackButton: ({ text, fallbackRoute }: Record<string, unknown>) => (
    <div
      data-testid="back-button"
      data-text={text}
      data-fallback-route={fallbackRoute}
    />
  )
}));

vi.mock('../Footer', () => ({
  Footer: () => <div data-testid="footer" />
}));

vi.mock('../RouteChangeAnnouncement', () => ({
  RouteChangeAnnouncement: () => <div data-testid="route-announcement" />
}));

vi.mock('../GenericDialog/GenericDialog', () => ({
  default: () => <div data-testid="generic-dialog" />
}));

type RenderLayoutOptions = {
  handle?: RouteHandleObject;
  withChild?: boolean;
};

const renderLayout = ({
  handle,
  withChild = true
}: RenderLayoutOptions = {}) => {
  const routes = [
    {
      path: '/',
      element: <Layout />,
      handle: withChild ? undefined : handle,
      children: withChild
        ? [
            {
              index: true,
              element: <div data-testid="outlet" />,
              handle
            }
          ]
        : []
    }
  ];

  const router = createMemoryRouter(routes);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <StoreProvider>
        <Theme>
          <RouterProvider router={router} />
        </Theme>
      </StoreProvider>
    </QueryClientProvider>
  );
};

describe('Layout component:', () => {
  afterEach(() => {
    mocks.collapsed = false;
    utils.sidemenu.setOverlay(false);
    utils.sidemenu.setCollapsed(false);
    utils.notify.dismiss();
    utils.notify.status.payload.value = {};
    utils.dialog.close();
    document.body.style.overflow = '';
  });

  it('renders the default layout when the route has no handle', () => {
    renderLayout();

    expect(screen.getByTestId('header')).toBeVisible();
    expect(screen.getByTestId('sidebar')).toBeVisible();
    expect(screen.getByTestId('footer')).toBeVisible();
    expect(screen.getByTestId('outlet')).toBeVisible();
    expect(screen.getByTestId('route-announcement')).toBeVisible();
    expect(screen.getByTestId('generic-dialog')).toBeVisible();

    expect(screen.getByTestId('back-button')).toHaveAttribute(
      'data-text',
      'commons.back'
    );
    expect(screen.getByTestId('back-button')).not.toHaveAttribute(
      'data-fallback-route'
    );
    expect(screen.getByTestId('breadcrumbs')).toBeVisible();
  });

  it('applies the route handle options', () => {
    renderLayout({
      handle: {
        backButton: true,
        backButtonText: 'custom.back',
        backFallbackRoute: 'HOME',
        enableSmartBack: false,
        hideBreadcrumbs: true,
        sidebar: { visible: false },
        custom: true
      }
    });

    expect(screen.queryByTestId('sidebar')).toBeNull();
    expect(screen.queryByTestId('breadcrumbs')).toBeNull();
    expect(screen.getByTestId('back-button')).toHaveAttribute(
      'data-text',
      'custom.back'
    );
    expect(screen.getByTestId('back-button')).toHaveAttribute(
      'data-fallback-route',
      PageRoutes.HOME
    );
    expect(screen.getByTestId('outlet')).toBeVisible();
  });

  it('falls back to the default back button text', () => {
    renderLayout({
      handle: { backButtonText: undefined, sidebar: { visible: true } }
    });

    expect(screen.getByTestId('back-button')).toHaveAttribute(
      'data-text',
      'commons.back'
    );
  });

  it('does not render the back button when disabled', () => {
    renderLayout({
      handle: { backButton: false, sidebar: { visible: true } }
    });

    expect(screen.queryByTestId('back-button')).toBeNull();
    expect(screen.getByTestId('breadcrumbs')).toBeVisible();
  });

  it('renders the collapsed layout when the menu is collapsed', () => {
    mocks.collapsed = true;

    renderLayout();

    expect(document.getElementById('main-content')?.className).toContain(
      'MuiGrid-grid-xs-11'
    );
  });

  it('renders the full width layout when the sidebar is hidden', () => {
    renderLayout({ handle: { sidebar: { visible: false } } });

    expect(document.getElementById('main-content')?.className).toContain(
      'MuiGrid-grid-xs-12'
    );
  });

  it('locks the body scroll when the sidebar overlay is open', () => {
    utils.sidemenu.setOverlay(true);

    renderLayout();

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('keeps the body scroll unlocked when the sidebar overlay is closed', () => {
    utils.sidemenu.setOverlay(false);

    renderLayout();

    expect(document.body.style.overflow).toBe('auto');
  });

  it('handles a single route match', () => {
    renderLayout({
      withChild: false,
      handle: { hideBreadcrumbs: false, sidebar: { visible: true } }
    });

    expect(screen.queryByTestId('outlet')).toBeNull();
    expect(screen.getByTestId('back-button')).toBeVisible();
    expect(screen.getByTestId('breadcrumbs')).toBeVisible();
  });

  it('moves the focus to the main content when the skip link is clicked', () => {
    renderLayout();

    const mainContent = document.getElementById('main-content') as HTMLElement;
    const focusSpy = vi.spyOn(mainContent, 'focus');

    fireEvent.click(
      screen.getByRole('button', { name: 'commons.skipToContent' })
    );

    expect(focusSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(mainContent);
  });

  it('opens the assistance page in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderLayout();

    fireEvent.click(screen.getByTestId('header'));

    expect(openSpy).toHaveBeenCalledWith('/', '_blank');

    openSpy.mockRestore();
  });

  it('does not throw when the main content is missing when skipping', () => {
    renderLayout();

    document.getElementById('main-content')?.remove();

    expect(() =>
      fireEvent.click(
        screen.getByRole('button', { name: 'commons.skipToContent' })
      )
    ).not.toThrow();
  });

  it('renders the notification payload', () => {
    utils.notify.emit('operation completed', 'success', 'Success');

    renderLayout();

    expect(screen.getByText('operation completed')).toBeVisible();
    expect(screen.getByText('Success')).toBeVisible();
  });

  it('renders the notification fallbacks when the payload is empty', () => {
    utils.notify.status.payload.value = {};
    utils.notify.status.isVisible.value = true;

    renderLayout();

    expect(screen.getByText('unkown error')).toBeVisible();
  });
});
