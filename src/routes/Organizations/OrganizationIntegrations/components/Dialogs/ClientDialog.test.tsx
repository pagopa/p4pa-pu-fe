import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { PdndClientDialog } from './ClientDialog';
import type { PdndClientNoSecretDTO } from '@generated/core/data-contracts';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { copyWithFeedback } from '@core/utils/clipboard';

vi.mock('@core/utils/clipboard', () => ({
  copyWithFeedback: vi.fn()
}));

vi.mock('@core/components/BaseDialog', () => ({
  BaseDialog: ({
    open,
    title,
    description,
    actions,
    children
  }: {
    open: boolean;
    title: string;
    description: string;
    actions: React.ReactNode;
    children: React.ReactNode;
  }) =>
    open ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        {actions}
      </div>
    ) : null
}));

vi.mock('@core/components/CopiableField', () => ({
  CopiableField: ({ label, value }: { label: string; value: string }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}));

const client = {
  clientId: 'client-a',
  clientName: 'Client A',
  kid: 'kid-1',
  publicKey: 'public-key'
} as PdndClientNoSecretDTO;

const onClose = vi.fn();
const onEdit = vi.fn();

const renderDialog = () =>
  render(
    <PdndClientDialog open client={client} onClose={onClose} onEdit={onEdit} />
  );

describe('PdndClientDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the client name, id and kid', () => {
    renderDialog();

    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('client-a')).toBeInTheDocument();
    expect(screen.getByText('kid-1')).toBeInTheDocument();
  });

  it('calls onEdit with the client', () => {
    render(
      <PdndClientDialog
        open
        client={{ ...client, subUnitCode: 'SU1' }}
        onClose={onClose}
        onEdit={onEdit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.edit' }));

    expect(onEdit).toHaveBeenCalledWith({
      ...client,
      subUnitCode: 'SU1'
    });
  });

  it('masks the public key by default and reveals it when toggled', () => {
    renderDialog();

    expect(screen.getByText(SECRET_MASK)).toBeInTheDocument();
    expect(screen.queryByText('public-key')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.show' })
    );

    expect(screen.getByText('public-key')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.hide' })
    ).toBeInTheDocument();
  });

  it('copies the public key on click', () => {
    renderDialog();

    fireEvent.click(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.copy' })
    );

    expect(copyWithFeedback).toHaveBeenCalledWith(
      'public-key',
      'commons.copied'
    );
  });
});
