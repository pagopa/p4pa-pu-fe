import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiKeyDialog } from './ApiKeyDialog';
import { OrganizationApiKey } from '@generated/core/data-contracts';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import utils from '@core/utils';
import { fireEvent, render, waitFor, screen } from '@core/__tests__/renderers';
import {
  getOrganizationApiKey,
  deleteOrganizationApiKey
} from '@core/api/integrations';

vi.mock('@core/api/integrations', () => ({
  deleteOrganizationApiKey: vi.fn(),
  getOrganizationApiKey: vi.fn()
}));

const apiKey = { keyType: 'IO' } as OrganizationApiKey;
const mockMutateAsync = vi.fn();
const writeText = vi.fn();
const onClose = vi.fn();
const onDelete = vi.fn();

const renderDialog = () =>
  render(
    <ApiKeyDialog
      apiKey={apiKey}
      organizationId={33}
      open
      onClose={onClose}
      onDelete={onDelete}
    />
  );

describe('ApiKeyDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });

    vi.mocked(getOrganizationApiKey).mockReturnValue({
      data: { apiKey: 'secret-key' }
    } as unknown as ReturnType<typeof getOrganizationApiKey>);
    vi.mocked(deleteOrganizationApiKey).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof deleteOrganizationApiKey>);
  });

  it('loads and deletes the key for the given organization and key type', () => {
    renderDialog();

    expect(getOrganizationApiKey).toHaveBeenCalledWith(33, 'IO');
    expect(deleteOrganizationApiKey).toHaveBeenCalledWith(33, 'IO');
  });

  it('masks the key by default and reveals it when toggled', () => {
    renderDialog();

    expect(screen.getByText(SECRET_MASK)).toBeInTheDocument();
    expect(screen.queryByText('secret-key')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.show' })
    );

    expect(screen.getByText('secret-key')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.hide' })
    ).toBeInTheDocument();
  });

  it('copies the key to the clipboard', () => {
    renderDialog();

    fireEvent.click(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.copy' })
    );

    expect(writeText).toHaveBeenCalledWith('secret-key');
  });

  it('copies an empty string when the key has not loaded', () => {
    vi.mocked(getOrganizationApiKey).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof getOrganizationApiKey>);

    renderDialog();

    fireEvent.click(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.copy' })
    );

    expect(writeText).toHaveBeenCalledWith('');
  });

  it('notifies, calls onDelete and closes after a successful delete', async () => {
    mockMutateAsync.mockResolvedValue({});
    const notifySpy = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);

    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'commons.delete' }));

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith('commons.done', 'success');
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('notifies an error and closes, without calling onDelete, when the delete fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const notifySpy = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);

    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'commons.delete' }));

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith('errors.generic');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('disables the delete button while the delete is pending', () => {
    vi.mocked(deleteOrganizationApiKey).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    } as unknown as ReturnType<typeof deleteOrganizationApiKey>);

    renderDialog();

    expect(
      screen.getByRole('button', { name: 'commons.delete' })
    ).toBeDisabled();
  });
});
