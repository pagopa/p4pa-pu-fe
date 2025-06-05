import { describe, it, expect, vi } from 'vitest';
import { useApiOperations } from './useApiOperations';
import { PaymentMethodOption } from '../steps/Step2Behaviour/components/PaymentMethodSelector';
import { OperatorsSelection } from '../../../../generated/apiClient';
import { renderHook } from '../../../__tests__/renderers';

describe('useApiOperations', () => {
  const organizationId = 42;

  it('correctly creates request payload without xsdDefinitionRef and enabledOperators', async () => {
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
    expect(payload.data.debtPositionTypeOrg.xsdDefinitionRef).toBeUndefined();
    expect(payload.data.enabledOperators).toBeUndefined();
  });

  it('includes xsdDefinitionRef text when paymentMethod is CUSTOM and file provided', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    // Mock File with a text method
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

  it('includes enabledOperators only when operatorsSelection is SELECTED and enabledOperators exist', async () => {
    const { result } = renderHook(() => useApiOperations(organizationId));

    const mockDataWithOperators = {
      debtPositionTypeId: '789',
      description: 'desc',
      code: 'code',
      paymentMethod: PaymentMethodOption.FREE,
      operatorsSelection: OperatorsSelection.SELECTED,
      enabledOperators: ['op1', 'op2']
    };

    const payload = await result.current.createRequestPayload(
      mockDataWithOperators
    );

    expect(payload.data.enabledOperators).toEqual(['op1', 'op2']);
  });
});
