import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { deletePdndService } from '@core/api/integrations';
import type { PdndServiceView } from '@generated/core/data-contracts';
import notify from '@core/utils/notify';

import { PdndSendServiceDialog } from './ServiceDialog';

vi.mock('@core/api/integrations', () => ({
  deletePdndService: vi.fn()
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

const service = {
  serviceType: 'SEND',
  clientName: 'Client A',
  purposeId: 'purp_1',
  clientId: 'client-a'
} as PdndServiceView;

const mockMutateAsync = vi.fn();
const onClose = vi.fn();
const onDelete = vi.fn();

const renderDialog = (value = service) =>
  render(
    <PdndSendServiceDialog
      service={value}
      organizationId={33}
      open
      onClose={onClose}
      onDelete={onDelete}
    />
  );

describe('PdndSendServiceDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(deletePdndService).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof deletePdndService>);
  });

  it('renders the service details', () => {
    renderDialog();

    expect(screen.getByText('SEND')).toBeInTheDocument();
    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('purp_1')).toBeInTheDocument();
    expect(screen.getByText('client-a')).toBeInTheDocument();
  });

  it('initializes the delete mutation with the organization and purpose IDs', () => {
    renderDialog();

    expect(deletePdndService).toHaveBeenCalledWith(33, 'purp_1');
  });

  it('notifies, calls onDelete and closes after a successful delete', async () => {
    mockMutateAsync.mockResolvedValue({});

    const notifySpy = vi
      .spyOn(notify, 'emit')
      .mockImplementation(() => undefined);

    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'commons.delete' }));

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith('commons.done', 'success');
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('notifies an error and closes without calling onDelete when deletion fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));

    const notifySpy = vi
      .spyOn(notify, 'emit')
      .mockImplementation(() => undefined);

    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'commons.delete' }));

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith('errors.generic');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('disables the delete button while deletion is pending', () => {
    vi.mocked(deletePdndService).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    } as unknown as ReturnType<typeof deletePdndService>);

    renderDialog();

    expect(
      screen.getByRole('button', { name: 'commons.delete' })
    ).toBeDisabled();
  });

  it('uses an empty purpose ID and hides the purpose ID field when purposeId is missing', () => {
    renderDialog({
      ...service,
      purposeId: undefined
    });

    expect(deletePdndService).toHaveBeenCalledWith(33, '');

    expect(
      screen.queryByText('integrations.serviceDialog.purposeId')
    ).not.toBeInTheDocument();

    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('client-a')).toBeInTheDocument();

    expect(onClose).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
