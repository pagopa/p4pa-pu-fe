import { describe, expect, it } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { SubUnitIntegrations } from './SubUnitIntegrations';

describe('SubUnitIntegrations', () => {
  it('renders the search bar and the e-services grid headers', () => {
    render(<SubUnitIntegrations />);

    expect(
      screen.getByLabelText('organizations.integrations.searchSubUnit')
    ).toBeInTheDocument();
    expect(
      screen.getByText('organizations.integrations.pdndServices')
    ).toBeInTheDocument();
    [
      'organizations.integrations.subUnit',
      'organizations.integrations.subUnitName',
      'organizations.integrations.serviceType',
      'organizations.integrations.clientId'
    ].forEach((header) =>
      expect(
        screen.getByRole('columnheader', { name: header })
      ).toBeInTheDocument()
    );
  });

  it('renders an empty grid', () => {
    render(<SubUnitIntegrations />);

    expect(screen.getByText('commons.noRows')).toBeInTheDocument();
  });

  it('keeps the typed search value', async () => {
    render(<SubUnitIntegrations />);
    const search = screen.getByLabelText(
      'organizations.integrations.searchSubUnit'
    );

    await userEvent.type(search, 'SU1');

    expect(search).toHaveValue('SU1');
  });
});
