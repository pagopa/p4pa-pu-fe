import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, generatePath } from 'react-router';

import {
  Registry,
  Management,
  Accounting,
  Payment
} from './OrganizationDetailSections';
import { OrganizationDetail } from '../../../../generated/core/data-contracts';
import { PageRoutes } from '@core/routes';

const baseOrganization = {
  organizationId: 123,
  orgName: 'Comune di Test'
} as unknown as OrganizationDetail;

const renderWithRouter = (ui: JSX.Element) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Registry', () => {
  it('renders registry fields', () => {
    const data = {
      ...baseOrganization,
      ipaCode: 'IPA123',
      orgFiscalCode: 'CF123',
      orgTypeDescription: 'Comune',
      orgEmail: 'test@example.com'
    } as OrganizationDetail;

    render(<Registry organizationDetailData={data} />);

    expect(screen.getByText('IPA123')).toBeInTheDocument();
    expect(screen.getByText('CF123')).toBeInTheDocument();
    expect(screen.getByText('Comune')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('falls back to "-" for missing values', () => {
    render(<Registry organizationDetailData={baseOrganization} />);

    expect(screen.getAllByText('-')).toHaveLength(4);
  });
});

describe('Management', () => {
  const data = {
    ...baseOrganization,
    debtPositionTypeOrgCount: 3,
    operatorsCount: 7
  } as OrganizationDetail;

  it('renders debt types and operators counts', () => {
    renderWithRouter(<Management organizationDetailData={data} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('links to the debt types and operators pages', () => {
    renderWithRouter(<Management organizationDetailData={data} />);

    const debtTypesLink = screen
      .getByText('organizations.management.debtTypesLink')
      .closest('a');
    const operatorsLink = screen
      .getByText('organizations.management.operatorsLink')
      .closest('a');

    expect(debtTypesLink).toHaveAttribute(
      'href',
      generatePath(PageRoutes.DEBT_TYPES_DASHBOARD_BYORG, {
        organizationId: data.organizationId
      })
    );
    expect(operatorsLink).toHaveAttribute(
      'href',
      generatePath(PageRoutes.BROKER_OPERATORS, {
        organizationId: data.organizationId,
        orgName: data.orgName
      })
    );
  });
});

describe('Accounting', () => {
  it('renders accounting fields', () => {
    const data = {
      ...baseOrganization,
      iban: 'IT00A0000000000000000000000',
      postalIban: 'IT00B0000000000000000000000',
      cbillInterBankCode: 'ABCDE'
    } as OrganizationDetail;

    render(<Accounting organizationDetailData={data} />);

    expect(screen.getByText('IT00A0000000000000000000000')).toBeInTheDocument();
    expect(screen.getByText('IT00B0000000000000000000000')).toBeInTheDocument();
    expect(screen.getByText('ABCDE')).toBeInTheDocument();
  });

  it.each([
    [true, 'commons.enabled'],
    [false, 'commons.disabled']
  ])(
    'shows cash journal status when flagTreasury=%s',
    (flagTreasury, expected) => {
      const data = { ...baseOrganization, flagTreasury } as OrganizationDetail;

      render(<Accounting organizationDetailData={data} />);

      expect(screen.getByText(expected)).toBeInTheDocument();
    }
  );
});

describe('Payment', () => {
  const displayNames = {
    of: vi.fn((code: string) => (code === 'fr' ? 'French' : code))
  } as unknown as Intl.DisplayNames;

  it('renders segregation code and resolves the additional language', () => {
    const data = {
      ...baseOrganization,
      segregationCode: 'SEG123',
      additionalLanguage: 'FR'
    } as OrganizationDetail;

    render(
      <Payment organizationDetailData={data} displayNames={displayNames} />
    );

    expect(screen.getByText('SEG123')).toBeInTheDocument();
    expect(displayNames.of).toHaveBeenCalledWith('FR');
  });

  it('does not resolve a language when additionalLanguage is missing', () => {
    render(
      <Payment
        organizationDetailData={baseOrganization}
        displayNames={displayNames}
      />
    );

    expect(displayNames.of).not.toHaveBeenCalled();
  });

  it('shows push and outcome notification statuses', () => {
    const data = {
      ...baseOrganization,
      flagNotifyOutcomePush: true,
      flagPaymentNotification: false
    } as OrganizationDetail;

    render(
      <Payment organizationDetailData={data} displayNames={displayNames} />
    );

    expect(
      screen.getByText('organizations.paymentPushNotification')
    ).toBeInTheDocument();
    expect(
      screen.getByText('organizations.paymentNotified')
    ).toBeInTheDocument();
    expect(screen.getAllByText('commons.enabled')).toHaveLength(1);
    expect(screen.getAllByText('commons.disabled')).toHaveLength(1);
  });
});
