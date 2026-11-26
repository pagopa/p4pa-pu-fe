import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { PdndServiceView } from '@generated/core/data-contracts';

import { PdndSendServiceDialog } from './ServiceDialog';

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
  clientId: 'client-a',
  serviceName: 'Service A'
} as PdndServiceView;

const onClose = vi.fn();
const onEdit = vi.fn();

const renderDialog = (value = service) =>
  render(
    <PdndSendServiceDialog
      service={value}
      open
      onClose={onClose}
      onEdit={onEdit}
    />
  );

describe('PdndSendServiceDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the service details', () => {
    renderDialog();

    expect(screen.getByText('SEND')).toBeInTheDocument();
    expect(screen.getByText('Service A')).toBeInTheDocument();
    expect(screen.getByText('purp_1')).toBeInTheDocument();
    expect(screen.getByText('client-a')).toBeInTheDocument();
  });

  it('calls onEdit with the service', () => {
    renderDialog({ ...service, subUnitCode: 'SU1' });

    fireEvent.click(screen.getByRole('button', { name: 'commons.edit' }));

    expect(onEdit).toHaveBeenCalledWith({
      ...service,
      subUnitCode: 'SU1'
    });
  });

  it('hides the purpose ID field when purposeId is missing', () => {
    renderDialog({
      ...service,
      purposeId: undefined
    });

    expect(
      screen.queryByText('integrations.serviceDialog.purposeId')
    ).not.toBeInTheDocument();

    expect(screen.getByText('Service A')).toBeInTheDocument();
    expect(screen.getByText('client-a')).toBeInTheDocument();

    expect(onClose).not.toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
  });
});
