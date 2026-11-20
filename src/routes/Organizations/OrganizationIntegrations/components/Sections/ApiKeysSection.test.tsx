import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@core/__tests__/renderers';

import { ApiKeysSection } from './ApiKeysSection';
import type { OrganizationApiKey } from '@generated/core/client';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { useDeleteOrganizationApiKey } from '@core/api/integrations';
import notify from '@core/utils/notify';
import utils from '@core/utils';
import { OrganizationApiKeyType } from '@generated/core/data-contracts';

vi.mock('@core/api/integrations', () => ({
  useDeleteOrganizationApiKey: vi.fn()
}));

vi.mock('@core/utils/notify', () => ({
  default: { emit: vi.fn() }
}));

vi.mock('@core/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@core/utils')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      dialog: {
        open: vi.fn(),
        close: vi.fn()
      }
    }
  };
});

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate
}));

vi.mock('../Dialogs/ApiKeyDialog', () => ({
  ApiKeyDialog: ({
    organizationApiKey,
    organizationId,
    onClose,
    onEdit
  }: {
    organizationApiKey: OrganizationApiKey;
    organizationId: number;
    onClose: () => void;
    onEdit: (apiKey: OrganizationApiKey) => void;
  }) => (
    <div
      data-testid="api-key-dialog"
      data-key-type={organizationApiKey.keyType}
      data-organization-id={organizationId}
    >
      <button data-testid="close-dialog" onClick={onClose}>
        close
      </button>
      <button data-testid="edit-key" onClick={() => onEdit(organizationApiKey)}>
        edit
      </button>
    </div>
  )
}));

const apiKeys = [
  { keyType: 'IO' },
  { keyType: 'SEND' }
] as Array<OrganizationApiKey>;

const renderSection = (keys = apiKeys, onDelete = vi.fn()) =>
  render(
    <ApiKeysSection
      organizationApiKeys={keys}
      organizationId={33}
      onDelete={onDelete}
    />
  );

describe('ApiKeysSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteOrganizationApiKey).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof useDeleteOrganizationApiKey>);
    mockMutateAsync.mockResolvedValue({});
  });

  it('renders nothing when there are no api keys', () => {
    const { container } = renderSection([]);

    expect(screen.getByRole('heading')).toHaveTextContent(
      'organizations.integrations.pagoPaProducts'
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      container.querySelector('[data-testid="api-key-dialog"]')
    ).not.toBeInTheDocument();
  });

  // The component translates with a keyPrefix, so match on the key's suffix
  // instead of assuming the exact string the i18n mock produces.
  it('renders a row per api key with its name and a masked value', () => {
    renderSection();

    expect(screen.getByText(/keyTypes\.IO$/)).toBeInTheDocument();
    expect(screen.getByText(/keyTypes\.SEND$/)).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /hiddenApiKey$/ })).toHaveLength(
      2
    );
    expect(screen.getAllByText(SECRET_MASK)).toHaveLength(2);
  });

  it('shows the status chip only when flagActive is defined', () => {
    renderSection([
      { keyType: 'IO', flagActive: true },
      { keyType: 'SEND', flagActive: false },
      { keyType: 'PDND' }
    ] as Array<OrganizationApiKey>);

    expect(screen.getByText(/(^|\.)active$/)).toBeInTheDocument();
    expect(screen.getByText(/(^|\.)inactive$/)).toBeInTheDocument();
    expect(screen.getAllByText(/ioNotifications$/)).toHaveLength(2);
  });

  it('opens the dialog for the selected key, and closes it on close', () => {
    renderSection();

    expect(screen.queryByTestId('api-key-dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[1]);
    fireEvent.click(screen.getByRole('menuitem', { name: /showItem/i }));

    const dialog = screen.getByTestId('api-key-dialog');
    expect(dialog).toHaveAttribute('data-key-type', 'SEND');
    expect(dialog).toHaveAttribute('data-organization-id', '33');

    fireEvent.click(screen.getByTestId('close-dialog'));

    expect(screen.queryByTestId('api-key-dialog')).not.toBeInTheDocument();
  });

  it('passes the selected key to the dialog edit callback', () => {
    renderSection();

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /showItem/i }));
    fireEvent.click(screen.getByTestId('edit-key'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('keyType=IO')
    );
  });

  it('includes serviceEnabled for an IO key when editing', () => {
    renderSection([{ keyType: OrganizationApiKeyType.IO, flagActive: true }]);

    fireEvent.click(screen.getByRole('button', { name: /openMenu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /modifyItem/i }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('keyType=IO&serviceEnabled=true')
    );
  });

  it('does not include serviceEnabled for non-IO keys', () => {
    renderSection([{ keyType: OrganizationApiKeyType.SEND }]);

    fireEvent.click(screen.getByRole('button', { name: /openMenu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /modifyItem/i }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('keyType=SEND')
    );
    expect(mockNavigate.mock.calls[0][0]).not.toContain('serviceEnabled');
  });

  it('confirms deletion and refreshes after a successful delete', async () => {
    const onDelete = vi.fn();
    vi.mocked(utils.dialog.open).mockImplementation((options) => {
      options.onConfirm?.();
    });

    renderSection(apiKeys, onDelete);

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /deleteItem/i }));

    await vi.waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        organizationApiKeyType: OrganizationApiKeyType.IO
      });
      expect(notify.emit).toHaveBeenCalledWith(
        'organizations.integrations.commons.done',
        'success'
      );
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error notification when deletion fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('delete failed'));
    vi.mocked(utils.dialog.open).mockImplementation((options) => {
      options.onConfirm?.();
    });

    const onDelete = vi.fn();
    renderSection(apiKeys, onDelete);

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /deleteItem/i }));

    await vi.waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith(
        'organizations.integrations.errors.generic'
      );
    });
    expect(onDelete).not.toHaveBeenCalled();
  });
});
