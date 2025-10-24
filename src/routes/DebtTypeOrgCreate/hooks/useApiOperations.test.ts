import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '../../../__tests__/renderers';
import { useApiOperations } from './useApiOperations';
import { OperatorsSelection } from '../../../../generated/apiClient';
import { PaymentMethodOption } from '../types';

describe('useApiOperations', () => {
  const organizationId = 42;

  const minimalFormData = {
    debtPositionTypeId: '123',
    description: 'Test Description',
    code: 'TEST_CODE',
    paymentMethod: PaymentMethodOption.FREE,
    operatorsSelection: OperatorsSelection.ALL
  };

  it('creates basic payload with required fields', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const payload = await result.current.createRequestPayload(minimalFormData);

    expect(payload.organizationId).toBe(organizationId);
    expect(payload.data.debtPositionTypeOrg).toMatchObject({
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
    expect(payload.data.operatorsSelection).toBe(OperatorsSelection.ALL);
    expect(payload.data.enabledOperators).toEqual([]);
    expect(payload.data.disabledOperators).toEqual([]);
  });

  it('converts euro amount to cents for AMOUNT payment method', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      paymentMethod: PaymentMethodOption.AMOUNT,
      amountCents: 10.5
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.debtPositionTypeOrg.amountCents).toBe(1050);
  });

  it('includes external payment URL for EXTERNAL payment method', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      paymentMethod: PaymentMethodOption.EXTERNAL,
      externalPaymentUrl: 'https://example.com/payment'
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.debtPositionTypeOrg.externalPaymentUrl).toBe(
      'https://example.com/payment'
    );
  });

  it('converts file to text for CUSTOM payment method', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockFile = {
      text: vi.fn().mockResolvedValue('<xsd>mock schema</xsd>')
    } as unknown as File;

    const formData = {
      ...minimalFormData,
      paymentMethod: PaymentMethodOption.CUSTOM,
      xsdDefinitionRef: mockFile
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(mockFile.text).toHaveBeenCalledTimes(1);
    expect(payload.data.debtPositionTypeOrg.xsdDefinitionRef).toBe(
      '<xsd>mock schema</xsd>'
    );
  });

  it('does not include xsdDefinitionRef when no file provided for CUSTOM', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      paymentMethod: PaymentMethodOption.CUSTOM
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.debtPositionTypeOrg.xsdDefinitionRef).toBeUndefined();
  });

  it('includes optional bank account fields when provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      iban: 'IT60X0542811101000000123456',
      postalIban: 'IT60X0542811101000000654321',
      postalAccountCode: '123456789',
      holderPostalCc: 'John Doe',
      balance: 'Balance Info',
      orgSector: 'Public'
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.debtPositionTypeOrg).toMatchObject({
      iban: 'IT60X0542811101000000123456',
      postalIban: 'IT60X0542811101000000654321',
      postalAccountCode: '123456789',
      holderPostalCc: 'John Doe',
      balance: 'Balance Info',
      orgSector: 'Public'
    });
  });

  it('excludes optional bank account fields when not provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const payload = await result.current.createRequestPayload(minimalFormData);

    expect(payload.data.debtPositionTypeOrg.iban).toBeUndefined();
    expect(payload.data.debtPositionTypeOrg.postalIban).toBeUndefined();
    expect(payload.data.debtPositionTypeOrg.postalAccountCode).toBeUndefined();
    expect(payload.data.debtPositionTypeOrg.holderPostalCc).toBeUndefined();
    expect(payload.data.debtPositionTypeOrg.balance).toBeUndefined();
    expect(payload.data.debtPositionTypeOrg.orgSector).toBeUndefined();
  });

  it('handles boolean flags correctly', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      flagSpontaneous: true,
      flagMandatoryDueDate: true,
      flagAnonymousFiscalCode: true,
      flagNotifyIo: true,
      flagNotifyOutcomePush: 'enabled' as const
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.debtPositionTypeOrg).toMatchObject({
      flagSpontaneous: true,
      flagMandatoryDueDate: true,
      flagAnonymousFiscalCode: true,
      flagNotifyIo: true,
      flagNotifyOutcomePush: true
    });
  });

  it('sets flagNotifyOutcomePush to false when not enabled', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      flagNotifyOutcomePush: 'disabled' as const
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.debtPositionTypeOrg.flagNotifyOutcomePush).toBe(false);
  });

  it('includes IO template fields when provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      serviceId: 'service-123',
      ioTemplateSubject: 'Payment Subject',
      ioTemplateMessage: 'Payment Message'
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.debtPositionTypeOrg).toMatchObject({
      serviceId: 'service-123',
      ioTemplateSubject: 'Payment Subject',
      ioTemplateMessage: 'Payment Message'
    });
  });

  it('includes notifyOutcomePushOrgSilServiceId when provided and not zero', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      notifyOutcomePushOrgSilServiceId: 456
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(
      payload.data.debtPositionTypeOrg.notifyOutcomePushOrgSilServiceId
    ).toBe(456);
  });

  it('excludes notifyOutcomePushOrgSilServiceId when zero', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      notifyOutcomePushOrgSilServiceId: 0
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(
      payload.data.debtPositionTypeOrg.notifyOutcomePushOrgSilServiceId
    ).toBeUndefined();
  });

  it('includes amountActualizationOrgSilServiceId when provided and not zero', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      amountActualizationOrgSilServiceId: 789
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(
      payload.data.debtPositionTypeOrg.amountActualizationOrgSilServiceId
    ).toBe(789);
  });

  it('excludes amountActualizationOrgSilServiceId when zero', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      amountActualizationOrgSilServiceId: 0
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(
      payload.data.debtPositionTypeOrg.amountActualizationOrgSilServiceId
    ).toBeUndefined();
  });

  it('includes operators when operatorsSelection is SELECTED', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      operatorsSelection: OperatorsSelection.SELECTED,
      enabledOperators: ['op1', 'op2'],
      disabledOperators: ['op3', 'op4']
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.operatorsSelection).toBe(OperatorsSelection.SELECTED);
    expect(payload.data.enabledOperators).toEqual(['op1', 'op2']);
    expect(payload.data.disabledOperators).toEqual(['op3', 'op4']);
  });

  it('uses empty arrays for operators when not provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const payload = await result.current.createRequestPayload(minimalFormData);

    expect(payload.data.enabledOperators).toEqual([]);
    expect(payload.data.disabledOperators).toEqual([]);
  });

  it('includes original data fields in edit mode', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const originalData = {
      debtPositionTypeOrgId: 999,
      flagActive: true,
      flagExternal: false,
      creationDate: '2023-01-01T00:00:00Z',
      updateDate: '2023-06-15T12:30:00Z',
      updateOperatorExternalId: 'operator-123',
      updateTraceId: 'trace-456'
    };

    const payload = await result.current.createRequestPayload(
      minimalFormData,
      originalData,
      true
    );

    expect(payload.data.debtPositionTypeOrg).toMatchObject({
      debtPositionTypeOrgId: 999,
      flagActive: true,
      flagExternal: false
    });
  });

  it('does not include original data fields in create mode', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const originalData = {
      debtPositionTypeOrgId: 999,
      flagActive: true,
      flagExternal: false
    };

    const payload = await result.current.createRequestPayload(
      minimalFormData,
      originalData,
      false
    );

    expect(
      payload.data.debtPositionTypeOrg.debtPositionTypeOrgId
    ).toBeUndefined();
    expect(payload.data.debtPositionTypeOrg.flagActive).toBeUndefined();
    expect(payload.data.debtPositionTypeOrg.flagExternal).toBeUndefined();
  });

  it('always sets flagAmountActualization to false', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const formData = {
      ...minimalFormData,
      amountActualizationOrgSilServiceId: 789
    };

    const payload = await result.current.createRequestPayload(formData);

    expect(payload.data.debtPositionTypeOrg.flagAmountActualization).toBe(
      false
    );
  });
});
