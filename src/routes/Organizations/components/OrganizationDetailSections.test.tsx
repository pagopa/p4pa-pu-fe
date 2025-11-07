import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import {
  OrganizationDetail,
  OrganizationStatus
} from '../../../../generated/data-contracts';
import {
  accountingInfo,
  paymentInfo,
  info,
  integrationBox
} from './OrganizationDetailSections';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import translationIT from '../../../translations/it/translations.json';
import type { TFunction } from 'i18next';

describe('OrganizationDetailSections helpers', () => {
  let originalDisplayNames: typeof Intl.DisplayNames | undefined;
  type DisplayNamesCtor = new (
    locales: Array<string> | string,
    options: { type: 'language' }
  ) => { of: (code: string) => string };

  beforeAll(() => {
    i18nTestSetup(translationIT as unknown as object);
    originalDisplayNames = (
      Intl as unknown as { DisplayNames?: typeof Intl.DisplayNames }
    ).DisplayNames;
    (Intl as unknown as { DisplayNames: DisplayNamesCtor }).DisplayNames = vi
      .fn()
      .mockImplementation(() => ({
        of: (code: string) => (code === 'fr' ? 'French' : code)
      })) as unknown as DisplayNamesCtor;
  });

  afterAll(() => {
    if (originalDisplayNames) {
      (
        Intl as unknown as { DisplayNames: typeof originalDisplayNames }
      ).DisplayNames = originalDisplayNames;
    }
  });

  const baseOrganization: OrganizationDetail = {
    organizationId: 123,
    orgName: 'Comune di Test',
    status: OrganizationStatus.ACTIVE,
    ipaCode: 'IPA123',
    orgFiscalCode: 'CF123',
    orgTypeCode: 'COMUNE'
  } as unknown as OrganizationDetail;

  const tMock: TFunction = ((key: string) => key) as unknown as TFunction;

  it('accountingInfo maps accounting fields and treasury flag correctly', () => {
    const data: OrganizationDetail = {
      ...baseOrganization,
      iban: 'IT00A0000000000000000000000',
      postalIban: 'IT00B0000000000000000000000',
      cbillInterBankCode: 'ABCDE',
      flagTreasury: true
    } as unknown as OrganizationDetail;

    const result = accountingInfo(data, tMock);

    expect(result).toHaveLength(4);
    expect(result[0].label).toBe('commons.iban');
    expect(result[0].value).toBe('IT00A0000000000000000000000');
    expect(result[3].label).toBe('commons.cashJournal');
    expect(result[3].value).toBe('commons.enabled');
  });

  it('paymentInfo exposes additional language, flags and secret correctly', () => {
    const data: OrganizationDetail = {
      ...baseOrganization,
      segregationCode: 'SEG123',
      additionalLanguage: 'fr',
      flagNotifyOutcomePush: true,
      flagPaymentNotification: false,
      generateNoticeApiKey: 'secret-key'
    } as unknown as OrganizationDetail;

    const displayNames = new Intl.DisplayNames(['it'], { type: 'language' });
    const result = paymentInfo(data, tMock, displayNames);

    expect(result).toHaveLength(5);
    expect(result[0].label).toBe('commons.segregationCode');
    expect(result[0].value).toBe('SEG123');
    expect(result[1].label).toBe('commons.additionalLanguage');
    expect(result[1].value).toBe('French');
    expect(result[2].label).toBe('organizations.paymentPushNotification');
    expect(result[2].value).toBe('commons.enabled');
    expect(result[3].label).toBe('organizations.paymentNotified');
    expect(result[3].value).toBe('commons.disabled');
    expect(result[4].childrenComponent).toBeDefined();
  });

  it('info builds state with label, chip color and action links', () => {
    const data: OrganizationDetail = {
      ...baseOrganization,
      status: OrganizationStatus.ACTIVE,
      operatorsCount: 7,
      debtPositionTypeOrgCount: 3
    } as unknown as OrganizationDetail;

    const result = info(data, tMock);

    expect(result[0].label).toBe('commons.state');
    expect(result[0].value).toBe('ENABLED');
    expect(result[0].valueType).toBe('status');
    expect(result[0].chipConfig?.color).toBe('success');

    const operators = result.find((r) => r.label === 'commons.operators');
    expect(operators?.value).toBe(7);
    expect(operators?.valueType).toBe('withicon');
    expect(operators?.iconConfig?.icon).toBeDefined();

    const debtTypes = result.find((r) => r.label === 'commons.debtTypes');
    expect(debtTypes?.value).toBe(3);
    expect(debtTypes?.valueType).toBe('withicon');
    expect(debtTypes?.iconConfig?.icon).toBeDefined();
  });

  it('Does not show operatorsCount and debtPositionTypeOrgCount if status is not ACTIVE', () => {
    const data: OrganizationDetail = {
      ...baseOrganization,
      status: OrganizationStatus.DRAFT,
      operatorsCount: 7,
      debtPositionTypeOrgCount: 3
    } as unknown as OrganizationDetail;

    const result = info(data, tMock);

    expect(result[0].label).toBe('commons.state');
    expect(result[0].value).toBe('DRAFT');
    expect(result[0].valueType).toBe('status');
    expect(result[0].chipConfig?.color).toBe('default');

    const operators = result.find((r) => r.label === 'commons.operators');
    expect(operators).toBeUndefined();

    const debtTypes = result.find((r) => r.label === 'commons.debtTypes');
    expect(debtTypes).toBeUndefined();
  });

  it('integrationBox exposes IO/SEND flags and secret fields correctly', () => {
    const data: OrganizationDetail = {
      ...baseOrganization,
      flagNotifyIo: true,
      ioApiKey: 'io-secret',
      pdndEnabled: false,
      sendApiKey: 'send-secret'
    } as unknown as OrganizationDetail;

    const result = integrationBox(data, tMock);

    const ioEnabled = result.find(
      (r) => r.label === 'organizations.ioMessagge'
    );
    expect(ioEnabled?.value).toBe('commons.enabled');
    const ioSecret = result.find((r) => r.childrenComponent && !r.label);
    expect(ioSecret).toBeDefined();

    const pdnd = result.find(
      (r) => r.label === 'organizations.pdndIntegration'
    );
    expect(pdnd?.value).toBe('commons.disabled');
    const sendSecret = result[result.length - 1];
    expect(sendSecret.childrenComponent).toBeDefined();
  });
});
