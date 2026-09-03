import { describe, it, expect } from 'vitest';
import { renderHook } from '../../../__tests__/renderers';
import { useApiOperations } from './useApiOperations';
import {
  DebtTypeOrgForm,
  PaymentMethodOption,
  SpontaneousMode
} from '../types';
import {
  DebtPositionTypeOrgBalanceCostType,
  OperatorsSelection
} from '@generated/core/data-contracts';

describe('useApiOperations', () => {
  const organizationId = 42;

  const createFormData = (
    overrides: Partial<DebtTypeOrgForm> = {}
  ): DebtTypeOrgForm =>
    ({
      debtPositionTypeId: '123',
      description: 'Test Description',
      code: 'TEST_CODE',
      paymentMethod: PaymentMethodOption.FREE,
      operatorsSelection: OperatorsSelection.ALL,
      ...overrides
    }) as DebtTypeOrgForm;

  const createPayload = async (
    formData: DebtTypeOrgForm = createFormData(),
    originalData?: Parameters<
      ReturnType<typeof useApiOperations>['createRequestPayload']
    >[1],
    isEdit = false
  ) => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    return result.current.createRequestPayload(formData, originalData, isEdit);
  };

  const getDebtPositionTypeOrg = async (
    formData: DebtTypeOrgForm = createFormData(),
    originalData?: Parameters<
      ReturnType<typeof useApiOperations>['createRequestPayload']
    >[1],
    isEdit = false
  ) => {
    const payload = await createPayload(formData, originalData, isEdit);

    return payload.data.debtPositionTypeOrg;
  };

  it('creates payload with required fields and default flags', async () => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg();

    expect(debtPositionTypeOrg).toMatchObject({
      debtPositionTypeId: 123,
      organizationId,
      description: 'Test Description',
      code: 'TEST_CODE',
      flagSpontaneous: false,
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: false,
      flagNotifyOutcomePush: false,
      flagAmountActualization: false
    });
  });

  it('includes optional fields when provided', async () => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData({
        iban: 'IT60X0542811101000000123456',
        postalIban: 'IT60X0542811101000000654321',
        postalAccountCode: '123456789',
        holderPostalCc: 'John Doe',
        balance: 'Balance Info',
        orgSector: 'Public',
        serviceId: 'service-123',
        ioTemplateSubject: 'Payment Subject',
        ioTemplateMessage: 'Payment Message'
      })
    );

    expect(debtPositionTypeOrg).toMatchObject({
      iban: 'IT60X0542811101000000123456',
      postalIban: 'IT60X0542811101000000654321',
      postalAccountCode: '123456789',
      holderPostalCc: 'John Doe',
      balance: 'Balance Info',
      orgSector: 'Public',
      serviceId: 'service-123',
      ioTemplateSubject: 'Payment Subject',
      ioTemplateMessage: 'Payment Message'
    });
  });

  it('excludes optional fields when not provided', async () => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg();

    expect(debtPositionTypeOrg).not.toHaveProperty('iban');
    expect(debtPositionTypeOrg).not.toHaveProperty('postalIban');
    expect(debtPositionTypeOrg).not.toHaveProperty('postalAccountCode');
    expect(debtPositionTypeOrg).not.toHaveProperty('holderPostalCc');
    expect(debtPositionTypeOrg).not.toHaveProperty('balance');
    expect(debtPositionTypeOrg).not.toHaveProperty('orgSector');
    expect(debtPositionTypeOrg).not.toHaveProperty('serviceId');
  });

  it('maps boolean flags correctly', async () => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData({
        flagSpontaneous: true,
        flagMandatoryDueDate: true,
        flagAnonymousFiscalCode: true,
        flagNotifyIo: true,
        flagNotifyOutcomePush: 'enabled'
      })
    );

    expect(debtPositionTypeOrg).toMatchObject({
      flagSpontaneous: true,
      flagMandatoryDueDate: true,
      flagAnonymousFiscalCode: true,
      flagNotifyIo: true,
      flagNotifyOutcomePush: true
    });
  });

  it('converts amount from euros to cents for AMOUNT payment method', async () => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData({
        paymentMethod: PaymentMethodOption.AMOUNT,
        amountCents: 10.5
      })
    );

    expect(debtPositionTypeOrg.amountCents).toBe(1050);
  });

  it('includes amountCents when preset amount is enabled', async () => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData({
        flagPresetAmount: true,
        amountCents: 15.75
      })
    );

    expect(debtPositionTypeOrg.amountCents).toBe(1575);
  });

  it.each([
    {
      paymentMethod: PaymentMethodOption.EXTERNAL,
      spontaneousMode: undefined,
      url: 'https://example.com/payment'
    },
    {
      paymentMethod: PaymentMethodOption.FREE,
      spontaneousMode: SpontaneousMode.EXTERNAL_URL,
      url: 'https://external-portal.com/payment'
    }
  ])(
    'includes external payment URL when the corresponding option is selected',
    async ({ paymentMethod, spontaneousMode, url }) => {
      const debtPositionTypeOrg = await getDebtPositionTypeOrg(
        createFormData({
          paymentMethod,
          spontaneousMode,
          externalPaymentUrl: url
        })
      );

      expect(debtPositionTypeOrg.externalPaymentUrl).toBe(url);
    }
  );

  it('includes spontaneous form ID only for custom form mode', async () => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData({
        spontaneousMode: SpontaneousMode.CUSTOM_FORM,
        customFormId: 123
      })
    );

    expect(debtPositionTypeOrg.spontaneousFormId).toBe(123);
  });

  it('does not include spontaneous form ID for other modes', async () => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData({
        spontaneousMode: SpontaneousMode.STANDARD,
        customFormId: 123
      })
    );

    expect(debtPositionTypeOrg).not.toHaveProperty('spontaneousFormId');
  });

  it.each([
    {
      field: 'notifyOutcomePushOrgSilServiceId',
      value: 456
    },
    {
      field: 'amountActualizationOrgSilServiceId',
      value: 789
    }
  ])('includes $field when provided and non-zero', async ({ field, value }) => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData({
        [field]: value
      })
    );

    // @ts-expect-error using string key for indexing
    expect(debtPositionTypeOrg[field]).toBe(value);
  });

  it.each([
    'notifyOutcomePushOrgSilServiceId',
    'amountActualizationOrgSilServiceId'
  ])('excludes %s when zero', async (field) => {
    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData({
        [field]: 0
      })
    );

    expect(debtPositionTypeOrg).not.toHaveProperty(field);
  });

  it('includes selected operators', async () => {
    const payload = await createPayload(
      createFormData({
        operatorsSelection: OperatorsSelection.SELECTED,
        enabledOperators: ['op1', 'op2'],
        disabledOperators: ['op3', 'op4']
      })
    );

    expect(payload.data).toMatchObject({
      operatorsSelection: OperatorsSelection.SELECTED,
      enabledOperators: ['op1', 'op2'],
      disabledOperators: ['op3', 'op4']
    });
  });

  it('uses empty operator arrays when not provided', async () => {
    const payload = await createPayload();

    expect(payload.data.enabledOperators).toEqual([]);
    expect(payload.data.disabledOperators).toEqual([]);
  });

  it('preserves original fields in edit mode', async () => {
    const originalData = {
      debtPositionTypeOrgId: 999,
      flagActive: true,
      flagExternal: false
    };

    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData(),
      originalData,
      true
    );

    expect(debtPositionTypeOrg).toMatchObject({
      debtPositionTypeOrgId: 999,
      flagActive: true,
      flagExternal: false
    });
  });

  it('does not preserve original fields in create mode', async () => {
    const originalData = {
      debtPositionTypeOrgId: 999,
      flagActive: true,
      flagExternal: false
    };

    const debtPositionTypeOrg = await getDebtPositionTypeOrg(
      createFormData(),
      originalData,
      false
    );

    expect(debtPositionTypeOrg).not.toHaveProperty('debtPositionTypeOrgId');
    expect(debtPositionTypeOrg).not.toHaveProperty('flagActive');
    expect(debtPositionTypeOrg).not.toHaveProperty('flagExternal');
  });

  it('maps enabled balance costs preserving their values', async () => {
    const payload = await createPayload(
      createFormData({
        debtPositionTypeOrgBalanceCostRequestList: [
          {
            type: DebtPositionTypeOrgBalanceCostType.NOTIFICATION_COST,
            operatingYear: '2026',
            enabled: true,
            sectionCode: 'SEC01',
            sectionDescription: 'Section 1',
            officeCode: 'OFF01',
            officeDescription: 'Office 1',
            assessmentCode: 'ASS01',
            assessmentDescription: 'Assessment 1'
          }
        ]
      })
    );

    expect(payload.data.debtPositionTypeOrgBalanceCostRequestList).toEqual([
      {
        type: DebtPositionTypeOrgBalanceCostType.NOTIFICATION_COST,
        operatingYear: '2026',
        sectionCode: 'SEC01',
        sectionDescription: 'Section 1',
        officeCode: 'OFF01',
        officeDescription: 'Office 1',
        assessmentCode: 'ASS01',
        assessmentDescription: 'Assessment 1'
      }
    ]);
  });

  it('clears balance cost fields when the cost is disabled', async () => {
    const payload = await createPayload(
      createFormData({
        debtPositionTypeOrgBalanceCostRequestList: [
          {
            type: DebtPositionTypeOrgBalanceCostType.DELAY_COST,
            operatingYear: '2026',
            enabled: false,
            sectionCode: 'SEC01',
            sectionDescription: 'Section 1',
            officeCode: 'OFF01',
            officeDescription: 'Office 1',
            assessmentCode: 'ASS01',
            assessmentDescription: 'Assessment 1'
          }
        ]
      })
    );

    expect(payload.data.debtPositionTypeOrgBalanceCostRequestList).toEqual([
      {
        type: DebtPositionTypeOrgBalanceCostType.DELAY_COST,
        operatingYear: '2026',
        sectionCode: '',
        sectionDescription: '',
        officeCode: '',
        officeDescription: '',
        assessmentCode: '',
        assessmentDescription: ''
      }
    ]);
  });
});
