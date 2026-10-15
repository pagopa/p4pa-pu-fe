import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { PdndServiceView } from '@generated/core/client';
import { ServicesSection } from './ServiceSection';

vi.mock('../Dialogs/ServiceDialog', () => ({
  PdndSendServiceDialog: ({
    service,
    organizationId,
    onClose,
    onDelete
  }: {
    service: PdndServiceView;
    organizationId: number;
    onClose: () => void;
    onDelete: () => void;
  }) => (
    <div
      data-testid="service-dialog"
      data-client-id={service.clientId}
      data-organization-id={organizationId}
    >
      <button data-testid="close-dialog" onClick={onClose}>
        close
      </button>
      <button data-testid="delete-service" onClick={onDelete}>
        delete
      </button>
    </div>
  )
}));

const services = [
  {
    serviceName: 'SEND service',
    serviceType: 'SEND',
    purposeId: 'purp_1',
    clientId: 'client-a'
  },
  {
    serviceName: 'Other service',
    serviceType: 'SEND',
    clientId: 'client-b'
  }
] as Array<PdndServiceView>;

const renderSection = (list = services, onDelete = vi.fn()) =>
  render(
    <ServicesSection services={list} organizationId={33} onDelete={onDelete} />
  );

describe('ServicesSection', () => {
  it('renders nothing when there are no services', () => {
    const { container } = renderSection([]);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and a row per service, with a placeholder for a missing purposeId', () => {
    renderSection();

    expect(
      screen.getByRole('heading', {
        name: 'organizations.integrations.pdndServices'
      })
    ).toBeInTheDocument();
    ['SEND service', 'purp_1', 'client-a', 'Other service', 'client-b'].forEach(
      (value) => expect(screen.getByText(value)).toBeInTheDocument()
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('opens the dialog for the selected service, and closes it on close', () => {
    renderSection();

    expect(screen.queryByTestId('service-dialog')).not.toBeInTheDocument();

    // Every row's show button shares the same label, so pick by position.
    fireEvent.click(screen.getAllByRole('button')[1]);

    const dialog = screen.getByTestId('service-dialog');
    expect(dialog).toHaveAttribute('data-client-id', 'client-b');
    expect(dialog).toHaveAttribute('data-organization-id', '33');

    fireEvent.click(screen.getByTestId('close-dialog'));

    expect(screen.queryByTestId('service-dialog')).not.toBeInTheDocument();
  });

  it('forwards onDelete to the dialog', () => {
    const onDelete = vi.fn();
    renderSection(services, onDelete);

    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByTestId('delete-service'));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
