import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ApiKeysSection } from './ApiKeysSection';
import { OrganizationApiKey } from '@generated/core/client';
import { SECRET_MASK } from '@core/components/ShowSecretValue';

vi.mock('../Dialogs/ApiKeyDialog', () => ({
  ApiKeyDialog: ({
    apiKey,
    organizationId,
    onClose,
    onDelete
  }: {
    apiKey: OrganizationApiKey;
    organizationId: number;
    onClose: () => void;
    onDelete: () => void;
  }) => (
    <div
      data-testid="api-key-dialog"
      data-key-type={apiKey.keyType}
      data-organization-id={organizationId}
    >
      <button data-testid="close-dialog" onClick={onClose}>
        close
      </button>
      <button data-testid="delete-key" onClick={onDelete}>
        delete
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
    <ApiKeysSection apiKeys={keys} organizationId={33} onDelete={onDelete} />
  );

describe('ApiKeysSection', () => {
  it('renders nothing when there are no api keys', () => {
    const { container } = renderSection([]);

    expect(container).toBeEmptyDOMElement();
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

    // Every row's show button shares the same mocked label, so pick by position.
    fireEvent.click(screen.getAllByRole('button')[1]);

    const dialog = screen.getByTestId('api-key-dialog');
    expect(dialog).toHaveAttribute('data-key-type', 'SEND');
    expect(dialog).toHaveAttribute('data-organization-id', '33');

    fireEvent.click(screen.getByTestId('close-dialog'));

    expect(screen.queryByTestId('api-key-dialog')).not.toBeInTheDocument();
  });

  it('forwards onDelete to the dialog', () => {
    const onDelete = vi.fn();
    renderSection(apiKeys, onDelete);

    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByTestId('delete-key'));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
