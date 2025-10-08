import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import OrganizationDetailAlert from '../OrganizationDetailAlert';
import { OrganizationStatus } from '../../../../generated/apiClient';

describe('OrganizationDetailAlert Component', () => {
  const dataMock = {
    organizationId: 123,
    flagTreasury: false,
    ipaCode: 'IPA_TEST_2',
    orgFiscalCode: '99999999982',
    orgName: 'Ente P4PA intermediato 2',
    orgTypeCode: '03',
    orgEmail: 'enteditest2@email.it',
    postalIban: '',
    orgLogo: 'data:image',
    segregationCode: '01',
    cbillInterBankCode: '',
    status: OrganizationStatus.DRAFT,
    additionalLanguage: 'EN',
    startDate: '2024-12-19',
    brokerId: 1,
    ioApiKey: '6ba7',
    sendApiKey: '6ea5',
    generateNoticeApiKey: '406622f',
    flagNotifyIo: true,
    flagNotifyOutcomePush: false,
    flagPaymentNotification: false,
    pdndEnabled: false,
    debtPositionTypeOrgCount: 21,
    operatorsCount: 5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Alert with a waning on missed IBAN', async () => {
    render(
      <OrganizationDetailAlert
        editFunction={vi.fn()}
        organizationDetailData={dataMock}
      />
    );

    expect(screen.getByText('organizations.alertBody')).toBeInTheDocument();
  });

  it('renders Alert without anything cause no fields missing', async () => {
    const completeDataMock = { ...dataMock, iban: '111' };
    render(
      <OrganizationDetailAlert
        editFunction={vi.fn()}
        organizationDetailData={completeDataMock}
      />
    );

    const alert = screen.queryByTestId('org-empty-fields-error');
    expect(alert).not.toBeInTheDocument();
  });
});
