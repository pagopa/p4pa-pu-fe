import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import utils from '../../utils';
import { CourtesyPage } from '.';
import { operatorRoleState } from '../../store/OperatorRoleStore';
import { OperatorRole } from '../../../generated/data-contracts';
import { useNavigate } from 'react-router';
import { STATE } from '../../store/types';
import { PageRoutes } from '..';

// Mock icons as simple placeholders
vi.mock('../../assets/icons/abacus', () => ({
  AbacusIcon: () => <svg data-testid="abacus-icon"></svg>
}));
vi.mock('../../assets/icons/waiting', () => ({
  WaitingIcon: () => <svg data-testid="waiting-icon"></svg>
}));
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});
vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: {
      [STATE.ORGANIZATION_ID]: 123
    }
  })),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../../generated/data-contracts', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../generated/data-contracts')>();

  return {
    ...actual,
    OperatorRole: {
      ...actual.OperatorRole,
      ROLE_SUPERADMIN: 'ROLE_SUPERADMIN'
    }
  };
});

describe('CourtesyPage component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    // @ts-expect-error Mock window.location.replace safely for each test
    delete window.location;
    window.location = { replace: vi.fn() } as unknown as string & Location;
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders with AbacusIcon and admin translations by default', () => {
    operatorRoleState.value = OperatorRole.ROLE_ADMIN;
    render(<CourtesyPage />);

    expect(screen.getByTestId('abacus-icon')).toBeInTheDocument();
    expect(
      screen.getByText('DraftCourtesyPage.ROLE_ADMIN.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('DraftCourtesyPage.ROLE_ADMIN.description')
    ).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'commons.backToHome' });
    expect(button).toBeInTheDocument();
  });

  it('renders with WaitingIcon and operator translations for ROLE_OPER', () => {
    operatorRoleState.value = OperatorRole.ROLE_OPER;
    render(<CourtesyPage />);

    expect(screen.getByTestId('waiting-icon')).toBeInTheDocument();
    expect(
      screen.getByText('DraftCourtesyPage.ROLE_OPER.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('DraftCourtesyPage.ROLE_OPER.description')
    ).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'commons.backToHome' });
    expect(button).toBeInTheDocument();
  });

  it('calls window.location.replace with loginUrl on button click', () => {
    operatorRoleState.value = OperatorRole.ROLE_OPER;
    render(<CourtesyPage />);
    const button = screen.getByRole('button', { name: 'commons.backToHome' });

    fireEvent.click(button);

    expect(window.location.replace).toHaveBeenCalledWith(utils.config.loginUrl);
  });

  it('renders a specific cta button for ROLE_SUPERADMIN', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operatorRoleState.value = (OperatorRole as any).ROLE_SUPERADMIN;
    render(<CourtesyPage />);

    const button = screen.getByRole('button', { name: 'commons.configure' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(
      PageRoutes.ORGANIZATIONS_EDIT.replace(':organizationId', '123')
    );
  });
});
