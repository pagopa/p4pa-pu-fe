import { describe, it, expect, vi } from 'vitest';
import { useApiOperations } from './useApiOperations';
import { PaymentMethodOption } from '../steps/Step2Behaviour/components/PaymentMethodSelector';
import { OperatorsSelection } from '../../../../generated/apiClient';
import { renderHook } from '../../../__tests__/renderers';

describe('useApiOperations', () => {
  const organizationId = 42;

  it('correctly creates request payload with default values', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockData = {
      debtPositionTypeId: '123',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.FREE,
      operatorsSelection: OperatorsSelection.ALL
    };

    const payload = await result.current.createRequestPayload(mockData);

    expect(payload.organizationId).toBe(organizationId);
    expect(payload.data.debtPositionTypeOrg.debtPositionTypeId).toBe(123);
    expect(payload.data.debtPositionTypeOrg.flagNotifyOutcomePush).toBe(false);
    expect(payload.data.debtPositionTypeOrg.flagSpontaneous).toBe(false);
    expect(payload.data.debtPositionTypeOrg.flagMandatoryDueDate).toBe(false);
    expect(payload.data.debtPositionTypeOrg.flagAnonymousFiscalCode).toBe(
      false
    );
    expect(payload.data.debtPositionTypeOrg.flagNotifyIo).toBe(false);
    expect(payload.data.debtPositionTypeOrg.flagAmountActualization).toBe(
      false
    );

    expect(payload.data.debtPositionTypeOrg.xsdDefinitionRef).toBeUndefined();

    expect(payload.data.enabledOperators).toEqual([]);
    expect(payload.data.disabledOperators).toEqual([]);

    expect(payload.data.operatorsSelection).toBe(OperatorsSelection.ALL);
  });

  it('includes xsdDefinitionRef text when paymentMethod is CUSTOM and file provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockFile = {
      text: vi.fn().mockResolvedValue('<xml>mock content</xml>')
    } as unknown as File;

    const mockData = {
      debtPositionTypeId: '456',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.CUSTOM,
      xsdDefinitionRef: mockFile,
      operatorsSelection: OperatorsSelection.ALL
    };

    const payload = await result.current.createRequestPayload(mockData);

    expect(mockFile.text).toHaveBeenCalled();
    expect(payload.data.debtPositionTypeOrg.xsdDefinitionRef).toBe(
      '<xml>mock content</xml>'
    );
  });

  it('does not include xsdDefinitionRef when paymentMethod is CUSTOM but no file provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockData = {
      debtPositionTypeId: '456',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.CUSTOM,
      operatorsSelection: OperatorsSelection.ALL
    };

    const payload = await result.current.createRequestPayload(mockData);

    expect(payload.data.debtPositionTypeOrg.xsdDefinitionRef).toBeUndefined();
  });

  it('includes enabledOperators when operatorsSelection is SELECTED and enabledOperators provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockDataWithOperators = {
      debtPositionTypeId: '789',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.FREE,
      operatorsSelection: OperatorsSelection.SELECTED,
      enabledOperators: ['op1', 'op2'],
      disabledOperators: ['op3', 'op4']
    };

    const payload = await result.current.createRequestPayload(
      mockDataWithOperators
    );

    expect(payload.data.enabledOperators).toEqual(['op1', 'op2']);
    expect(payload.data.disabledOperators).toEqual(['op3', 'op4']);
    expect(payload.data.operatorsSelection).toBe(OperatorsSelection.SELECTED);
  });

  it('sets enabledOperators to empty array when not provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockData = {
      debtPositionTypeId: '789',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.FREE,
      operatorsSelection: OperatorsSelection.SELECTED
    };

    const payload = await result.current.createRequestPayload(mockData);

    expect(payload.data.enabledOperators).toEqual([]);
    expect(payload.data.disabledOperators).toEqual([]);
  });

  it('correctly handles notification flags', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockData = {
      debtPositionTypeId: '123',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.FREE,
      operatorsSelection: OperatorsSelection.ALL,
      flagNotifyOutcomePush: 'enabled' as const,
      flagNotifyIo: true,
      flagSpontaneous: true,
      flagMandatoryDueDate: true,
      flagAnonymousFiscalCode: true
    };

    const payload = await result.current.createRequestPayload(mockData);

    expect(payload.data.debtPositionTypeOrg.flagNotifyOutcomePush).toBe(true);
    expect(payload.data.debtPositionTypeOrg.flagNotifyIo).toBe(true);
    expect(payload.data.debtPositionTypeOrg.flagSpontaneous).toBe(true);
    expect(payload.data.debtPositionTypeOrg.flagMandatoryDueDate).toBe(true);
    expect(payload.data.debtPositionTypeOrg.flagAnonymousFiscalCode).toBe(true);
  });

  it('handles optional fields correctly', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockData = {
      debtPositionTypeId: '123',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.AMOUNT,
      operatorsSelection: OperatorsSelection.ALL,
      iban: 'IT123456789',
      amountCents: 1000,
      externalPaymentUrl: 'https://example.com',
      serviceId: 'service123',
      notifyOutcomePushOrgSilServiceId: 456,
      amountActualizationOrgSilServiceId: 789
    };

    const payload = await result.current.createRequestPayload(mockData);

    expect(payload.data.debtPositionTypeOrg.iban).toBe('IT123456789');
    expect(payload.data.debtPositionTypeOrg.amountCents).toBe(1000);
    expect(payload.data.debtPositionTypeOrg.externalPaymentUrl).toBe(
      'https://example.com'
    );
    expect(payload.data.debtPositionTypeOrg.serviceId).toBe('service123');
    expect(
      payload.data.debtPositionTypeOrg.notifyOutcomePushOrgSilServiceId
    ).toBe(456);
    expect(
      payload.data.debtPositionTypeOrg.amountActualizationOrgSilServiceId
    ).toBe(789);
    expect(payload.data.debtPositionTypeOrg.flagAmountActualization).toBe(true);
  });

  it('sets flagAmountActualization to false when service id is 0', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockData = {
      debtPositionTypeId: '123',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.FREE,
      operatorsSelection: OperatorsSelection.ALL,
      amountActualizationOrgSilServiceId: 0
    };

    const payload = await result.current.createRequestPayload(mockData);

    expect(payload.data.debtPositionTypeOrg.flagAmountActualization).toBe(
      false
    );
    expect(
      payload.data.debtPositionTypeOrg.amountActualizationOrgSilServiceId
    ).toBeUndefined();
  });

  it('handles edit mode with original data', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockData = {
      debtPositionTypeId: '123',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.FREE,
      operatorsSelection: OperatorsSelection.ALL
    };

    const originalData = {
      debtPositionTypeOrgId: 999,
      flagActive: true,
      flagExternal: false,
      creationDate: '2023-01-01',
      updateDate: '2023-01-02'
    };

    const payload = await result.current.createRequestPayload(
      mockData,
      originalData,
      true
    );

    expect(payload.data.debtPositionTypeOrg.debtPositionTypeOrgId).toBe(999);
    expect(payload.data.debtPositionTypeOrg.flagActive).toBe(true);
    expect(payload.data.debtPositionTypeOrg.flagExternal).toBe(false);
  });
});
