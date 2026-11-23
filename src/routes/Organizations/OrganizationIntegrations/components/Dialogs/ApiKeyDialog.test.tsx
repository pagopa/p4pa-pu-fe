import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiKeyDialog } from './ApiKeyDialog';
import type { OrganizationApiKey } from '@generated/core/data-contracts';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { fireEvent, render, screen } from '@core/__tests__/renderers';
import { useGetOrganizationApiKey } from '@core/api/integrations';
import { copyWithFeedback } from '@core/utils/clipboard';

vi.mock('@core/api/integrations', () => ({
  useGetOrganizationApiKey: vi.fn()
}));

vi.mock('@core/utils/clipboard', () => ({
  copyWithFeedback: vi.fn()
}));

const apiKey = { keyType: 'IO' } as OrganizationApiKey;
const onClose = vi.fn();
const onEdit = vi.fn();

const renderDialog = () =>
  render(
    <ApiKeyDialog
      organizationApiKey={apiKey}
      organizationId={33}
      open
      onClose={onClose}
      onEdit={onEdit}
    />
  );

describe('ApiKeyDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useGetOrganizationApiKey).mockReturnValue({
      data: { apiKey: 'secret-key' }
    } as unknown as ReturnType<typeof useGetOrganizationApiKey>);
  });

  it('loads the key for the given organization and key type', () => {
    renderDialog();

    expect(useGetOrganizationApiKey).toHaveBeenCalledWith(33, 'IO');
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

    expect(copyWithFeedback).toHaveBeenCalledWith(
      'secret-key',
      'commons.copied'
    );
  });

  it('calls onEdit with the organization API key', () => {
    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'commons.edit' }));

    expect(onEdit).toHaveBeenCalledWith(apiKey);
  });
});
