/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import {
  useDebtTypeOrgForm,
  mapDebtTypeOrgDetailToForm
} from './useDebtTypeOrgForm';
import { setOrganizationId } from '../../../store/OrganizationIdStore';
import { StoreProvider } from '../../../store/GlobalStore';
import { PaymentMethodOption, SpontaneousMode } from '../types';
import React from 'react';

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockCreateRequestPayload = vi.fn();

// Mock all dependencies
vi.mock('./useApiOperations', () => ({
  useApiOperations: () => ({
    createRequestPayload: mockCreateRequestPayload
  })
}));

vi.mock('../../../api/debtPositionsTypeOrg', () => ({
  createDebtPositionTypeOrg: () => ({
    mutateAsync: mockCreateMutateAsync
  }),
  updateDebtPositionTypeOrg: () => ({
    mutateAsync: mockUpdateMutateAsync
  }),
  getDebtPositionTypeOrgById: () => ({
    data: undefined,
    isLoading: false
  })
}));

vi.mock('../../../hooks/useDebtTypeOrgId', () => ({
  useDebtTypeOrgId: vi.fn((edit) => (edit ? 456 : undefined))
}));

vi.mock('./useFormSchemas', () => ({
  useFormSchemas: vi.fn(() => ({
    stepSchemas: [{ parse: vi.fn() }, { parse: vi.fn() }, { parse: vi.fn() }],
    combinedSchema: {
      parse: vi.fn()
    }
  }))
}));

vi.mock('../../../utils', () => ({
  default: {
    notify: { emit: vi.fn() }
  }
}));

describe('useDebtTypeOrgForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setOrganizationId(123);

    mockCreateRequestPayload.mockResolvedValue({
      organizationId: 123,
      data: {
        debtPositionTypeOrg: {},
        operatorsSelection: 'ALL',
        enabledOperators: [],
        disabledOperators: []
      }
    });

    mockCreateMutateAsync.mockResolvedValue({
      description: 'Created debt type'
    });

    mockUpdateMutateAsync.mockResolvedValue({
      description: 'Updated debt type'
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StoreProvider>{children}</StoreProvider>
  );

  it('initializes with correct default values', () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useDebtTypeOrgForm({ edit: false, onSuccess }),
      { wrapper }
    );

    expect(result.current.methods).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.validateStep).toBeDefined();
  });

  it('calls onCreate when submitting in create mode', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useDebtTypeOrgForm({ edit: false, onSuccess }),
      { wrapper }
    );

    const formData = result.current.methods.getValues();
    await result.current.handleSubmit(formData);

    await waitFor(() => {
      expect(mockCreateRequestPayload).toHaveBeenCalled();
      expect(mockCreateMutateAsync).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('Created debt type');
    });
  });

  it('calls onUpdate when submitting in edit mode', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useDebtTypeOrgForm({ edit: true, onSuccess }),
      { wrapper }
    );

    const formData = result.current.methods.getValues();
    await result.current.handleSubmit(formData);

    await waitFor(() => {
      expect(mockCreateRequestPayload).toHaveBeenCalled();
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('Updated debt type');
    });
  });

  it('handles create error gracefully', async () => {
    const onSuccess = vi.fn();
    mockCreateMutateAsync.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(
      () => useDebtTypeOrgForm({ edit: false, onSuccess }),
      { wrapper }
    );

    const formData = result.current.methods.getValues();
    await result.current.handleSubmit(formData);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles update error gracefully', async () => {
    const onSuccess = vi.fn();
    mockUpdateMutateAsync.mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(
      () => useDebtTypeOrgForm({ edit: true, onSuccess }),
      { wrapper }
    );

    const formData = result.current.methods.getValues();
    await result.current.handleSubmit(formData);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('validates step correctly', () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useDebtTypeOrgForm({ edit: false, onSuccess }),
      { wrapper }
    );

    const mockFormData: any = {
      debtPositionTypeId: '123',
      code: 'TEST',
      description: 'Test description'
    };

    const validationResult = result.current.validateStep(0, mockFormData);
    expect(validationResult).toHaveProperty('isValid');
    expect(validationResult).toHaveProperty('errors');
  });

  it('does not call update mutation in create mode', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useDebtTypeOrgForm({ edit: false, onSuccess }),
      { wrapper }
    );

    const formData = result.current.methods.getValues();
    await result.current.handleSubmit(formData);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalled();
      expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
    });
  });

  it('shows error when debtPositionTypeOrgId is missing in edit mode', async () => {
    const onSuccess = vi.fn();
    const mockNotifyEmit = vi.fn();

    const { useDebtTypeOrgId } = await import(
      '../../../hooks/useDebtTypeOrgId'
    );
    vi.mocked(useDebtTypeOrgId).mockReturnValue(undefined);

    const utils = await import('../../../utils');
    vi.mocked(utils.default.notify.emit).mockImplementation(mockNotifyEmit);

    const { result } = renderHook(
      () => useDebtTypeOrgForm({ edit: true, onSuccess }),
      { wrapper }
    );

    const formData = result.current.methods.getValues();
    await result.current.handleSubmit(formData);

    await waitFor(() => {
      expect(mockNotifyEmit).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
});

describe('mapDebtTypeOrgDetailToForm', () => {
  it('returns empty object when response is null', () => {
    const result = mapDebtTypeOrgDetailToForm(null);
    expect(result).toEqual({});
  });

  it('returns empty object when response is undefined', () => {
    const result = mapDebtTypeOrgDetailToForm(undefined);
    expect(result).toEqual({});
  });

  it('maps basic response fields correctly', () => {
    const response = {
      debtPositionTypeId: 123,
      code: 'TEST',
      description: 'Test description',
      flagNotifyOutcomePush: true
    };

    const result = mapDebtTypeOrgDetailToForm(response);

    expect(result.debtPositionTypeId).toBe('123');
    expect(result.code).toBe('TEST');
    expect(result.description).toBe('Test description');
    expect(result.flagNotifyOutcomePush).toBe('enabled');
  });

  it('converts flagNotifyOutcomePush false to disabled', () => {
    const response = {
      flagNotifyOutcomePush: false
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.flagNotifyOutcomePush).toBe('disabled');
  });

  it('converts amountCents from cents to euros', () => {
    const response = {
      amountCents: 10050
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.amountCents).toBe(100.5);
  });

  it('maps spontaneousFormId to customFormId', () => {
    const response = {
      spontaneousFormId: 456
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.customFormId).toBe(456);
  });

  it('sets flagPresetAmount based on amountCents presence', () => {
    const responseWithAmount = {
      amountCents: 1000
    };

    const result = mapDebtTypeOrgDetailToForm(responseWithAmount);
    expect(result.flagPresetAmount).toBe(true);
  });

  it('converts xsdDefinitionRef string to Blob', () => {
    const response = {
      xsdDefinitionRef: '<xml>test</xml>'
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.xsdDefinitionRef).toBeInstanceOf(Blob);
    expect(result.xsdDefinitionRef?.type).toBe('application/xml');
  });

  it('derives paymentMethod as AMOUNT when amountCents is present', () => {
    const response = {
      amountCents: 1000
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.paymentMethod).toBe(PaymentMethodOption.AMOUNT);
  });

  it('derives paymentMethod as CUSTOM when xsdDefinitionRef is present', () => {
    const response = {
      xsdDefinitionRef: '<xml>test</xml>'
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.paymentMethod).toBe(PaymentMethodOption.CUSTOM);
  });

  it('derives paymentMethod as EXTERNAL when externalPaymentUrl is present', () => {
    const response = {
      externalPaymentUrl: 'https://example.com'
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.paymentMethod).toBe(PaymentMethodOption.EXTERNAL);
  });

  it('derives paymentMethod as FREE when no payment fields are present', () => {
    const response = {
      code: 'TEST'
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.paymentMethod).toBe(PaymentMethodOption.FREE);
  });

  it('derives spontaneousMode as CUSTOM_FORM when spontaneousFormId is present', () => {
    const response = {
      spontaneousFormId: 123
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.spontaneousMode).toBe(SpontaneousMode.CUSTOM_FORM);
  });

  it('derives spontaneousMode as EXTERNAL_URL when externalPaymentUrl is present', () => {
    const response = {
      externalPaymentUrl: 'https://example.com'
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.spontaneousMode).toBe(SpontaneousMode.EXTERNAL_URL);
  });

  it('derives spontaneousMode as STANDARD when flagSpontaneous is true', () => {
    const response = {
      flagSpontaneous: true
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.spontaneousMode).toBe(SpontaneousMode.STANDARD);
  });

  it('derives spontaneousMode as undefined when no spontaneous fields are present', () => {
    const response = {
      code: 'TEST'
    };

    const result = mapDebtTypeOrgDetailToForm(response);
    expect(result.spontaneousMode).toBeUndefined();
  });
});
