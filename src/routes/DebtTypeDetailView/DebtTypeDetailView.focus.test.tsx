/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { DebtTypeDetailView } from './DebtTypeDetailView';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getDebtPositionTypeOrgById } from '../../api/debtPositionsTypeOrg';
import { getDebtPositionTypeOrgOperators } from '../../api/debtPositionTypeOrgOperators';
import { useDebtPositionTypeOrgSearch } from '../../api/debtTypesCreated';
import utils from '../../utils';
import { STATE } from '../../store/types';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn(() => ({ debtPositionTypeOrgId: '1' })),
    useNavigate: vi.fn(() => vi.fn()),
    generatePath: vi.fn()
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({ state: { [STATE.ORGANIZATION_ID]: 3 } })),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../api/debtPositionsTypeOrg', () => ({
  getDebtPositionTypeOrgById: vi.fn(),
  updateFlagActiveDebtPositionTypeOrg: vi.fn()
}));
vi.mock('../../api/debtPositionTypeOrgOperators', () => ({
  getDebtPositionTypeOrgOperators: vi.fn()
}));
vi.mock('../../api/debtTypesCreated', () => ({
  useDebtPositionTypeOrgSearch: vi.fn()
}));
vi.mock('../../api/debtPositions', () => ({
  default: {
    deleteDebtPositionTypeOrgs: vi.fn(() => ({ mutateAsync: vi.fn() }))
  }
}));
vi.mock('../../components/DetailAccordion/DetailAccordion', () => ({
  DetailAccordion: () => <div />
}));
vi.mock('../../utils', () => ({
  default: {
    notify: { emit: vi.fn() },
    config: { deployPath: '' },
    apiClient: { bff: {} }
  }
}));

describe('DebtTypeDetailView - focus and notification timing (real dialog)', () => {
  // recorded at the moment utils.notify.emit is called
  let dialogOpenOnEmit: boolean | undefined;
  let rootHiddenOnEmit: string | null | undefined;

  beforeEach(async () => {
    vi.clearAllMocks();
    dialogOpenOnEmit = undefined;
    rootHiddenOnEmit = undefined;

    (utils.notify.emit as any).mockImplementation(() => {
      dialogOpenOnEmit = !!document.querySelector('[role="dialog"]');
      rootHiddenOnEmit = document
        .querySelector('[data-testid="app-root"]')
        ?.getAttribute('aria-hidden') as string | null;
    });

    i18nTestSetup({
      'commons.enable': 'Abilita',
      'commons.delete': 'Elimina',
      'commons.close': 'Chiudi',
      'commons.enabled': 'Abilitato',
      'commons.disabled': 'Disabilitato',
      'debtTypeDetail.confirmEnableDialog.title': 'Sei sicuro?',
      'debtTypeDetail.confirmEnableDialog.description': 'Conferma',
      'debtTypeDetail.success.updated': 'Aggiornato con successo'
    });

    (getDebtPositionTypeOrgById as any).mockReturnValue({
      data: {
        response: {
          description: 'Test Debt Type',
          code: 'TEST_CODE',
          flagActive: false,
          debtPositionTypeId: 1,
          organizationId: 3
        }
      },
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null
    });
    (getDebtPositionTypeOrgOperators as any).mockReturnValue({
      data: { totalElements: 5 },
      isError: false,
      error: null
    });
    (useDebtPositionTypeOrgSearch as any).mockReturnValue({
      data: { content: [{ enabledOperators: 3 }] },
      mutate: vi.fn(),
      isError: false,
      error: null
    });

    const { updateFlagActiveDebtPositionTypeOrg } = await import(
      '../../api/debtPositionsTypeOrg'
    );
    (updateFlagActiveDebtPositionTypeOrg as any).mockImplementation(
      (onSuccess: () => void) => ({
        mutateAsync: vi.fn(async () => {
          onSuccess();
        })
      })
    );
  });

  it('closes the dialog, notifies outside the aria-hidden subtree and focuses the title', async () => {
    render(
      <div data-testid="app-root">
        <DebtTypeDetailView />
      </div>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Abilita' })[0]);

    const dialog = await screen.findByRole('dialog');
    expect(
      document
        .querySelector('[data-testid="app-root"]')
        ?.closest('body > *')
        ?.getAttribute('aria-hidden')
    ).toBe('true');

    fireEvent.click(
      Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent === 'Abilita'
      ) as HTMLElement
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'Aggiornato con successo',
      'success'
    );
    expect(dialogOpenOnEmit).toBe(false);
    expect(rootHiddenOnEmit).toBeNull();

    await waitFor(() => expect(screen.getByTestId('main-title')).toHaveFocus());

    // the status must be part of what the screen reader announces on focus
    const describedBy = screen
      .getByTestId('main-title')
      .getAttribute('aria-describedby') as string;
    expect(document.getElementById(describedBy)).toHaveTextContent(
      'Disabilitato'
    );
  });
});
