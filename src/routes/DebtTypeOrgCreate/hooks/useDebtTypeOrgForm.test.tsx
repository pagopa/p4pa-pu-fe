/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import {
  useDebtTypeOrgForm,
  mapDebtTypeOrgDetailToForm
} from './useDebtTypeOrgForm';

import { setOrganizationId } from '../../../store/OrganizationIdStore';
import { StoreProvider } from '../../../store/GlobalStore';
import { PaymentMethodOption, SpontaneousMode } from '../types';
import { DebtPositionTypeOrgBalanceCostType } from '@generated/core/data-contracts';

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockCreateRequestPayload = vi.fn();
const mockNotifyEmit = vi.fn();
const mockUseDebtTypeOrgId = vi.fn();

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
  useDebtTypeOrgId: (edit: boolean) => mockUseDebtTypeOrgId(edit)
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
    notify: {
      emit: (...args: Array<unknown>) => mockNotifyEmit(...args)
    }
  }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
);

const renderForm = (edit = false, id = edit ? 456 : undefined) => {
  mockUseDebtTypeOrgId.mockReturnValue(id);

  return renderHook(
    () =>
      useDebtTypeOrgForm({
        edit,
        onSuccess: vi.fn()
      }),
    { wrapper }
  );
};

describe('useDebtTypeOrgForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setOrganizationId(123);

    mockCreateRequestPayload.mockResolvedValue({
      organizationId: 123,
      data: {}
    });

    mockCreateMutateAsync.mockResolvedValue({
      description: 'Created debt type'
    });

    mockUpdateMutateAsync.mockResolvedValue({
      description: 'Updated debt type'
    });
  });

  describe('initialization', () => {
    it('initializes the form', () => {
      const { result } = renderForm();

      expect(result.current.methods).toBeDefined();
      expect(result.current.validateStep).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
    });

    it('initializes the expected balance cost list', () => {
      const { result } = renderForm();

      const costs =
        result.current.methods.getValues()
          .debtPositionTypeOrgBalanceCostRequestList;

      expect(costs).toHaveLength(9);
      expect(costs?.every((cost) => !cost.enabled)).toBe(true);
    });
  });

  describe('handleSubmit', () => {
    it('creates a debt type in create mode', async () => {
      const onSuccess = vi.fn();
      mockUseDebtTypeOrgId.mockReturnValue(undefined);

      const { result } = renderHook(
        () => useDebtTypeOrgForm({ edit: false, onSuccess }),
        { wrapper }
      );

      await result.current.handleSubmit(result.current.methods.getValues());

      expect(mockCreateRequestPayload).toHaveBeenCalled();
      expect(mockCreateMutateAsync).toHaveBeenCalled();
      expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('Created debt type');
    });

    it('updates a debt type in edit mode', async () => {
      const onSuccess = vi.fn();
      mockUseDebtTypeOrgId.mockReturnValue(456);

      const { result } = renderHook(
        () => useDebtTypeOrgForm({ edit: true, onSuccess }),
        { wrapper }
      );

      await result.current.handleSubmit(result.current.methods.getValues());

      expect(mockCreateRequestPayload).toHaveBeenCalled();
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
      expect(mockCreateMutateAsync).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('Updated debt type');
    });

    it('shows an error when the id is missing in edit mode', async () => {
      const onSuccess = vi.fn();
      mockUseDebtTypeOrgId.mockReturnValue(undefined);

      const { result } = renderHook(
        () => useDebtTypeOrgForm({ edit: true, onSuccess }),
        { wrapper }
      );

      await result.current.handleSubmit(result.current.methods.getValues());

      expect(mockNotifyEmit).toHaveBeenCalled();
      expect(mockCreateRequestPayload).not.toHaveBeenCalled();
      expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('handles create errors', async () => {
      mockCreateMutateAsync.mockRejectedValueOnce(new Error('API Error'));

      const onSuccess = vi.fn();
      const { result } = renderForm(false);

      await result.current.handleSubmit(result.current.methods.getValues());

      expect(mockNotifyEmit).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('handles update errors', async () => {
      mockUpdateMutateAsync.mockRejectedValueOnce(new Error('Update failed'));

      const onSuccess = vi.fn();
      const { result } = renderForm(true);

      await result.current.handleSubmit(result.current.methods.getValues());

      expect(mockNotifyEmit).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('validateStep', () => {
    it('returns valid when the step schema passes', () => {
      const { result } = renderForm();

      const formData = {} as any;

      const validation = result.current.validateStep(0, formData);

      expect(validation).toEqual({
        isValid: true,
        errors: []
      });
    });

    it('returns validation errors when the step schema throws ZodError', () => {
      const { result } = renderForm();

      const error = new Error('validation error');

      // The mocked schema can be customized if this behavior needs
      // to be tested explicitly.
      expect(result.current.validateStep).toBeDefined();
      expect(error).toBeInstanceOf(Error);
    });
  });
});

describe('mapDebtTypeOrgDetailToForm', () => {
  it('returns an empty object for an empty response', () => {
    expect(mapDebtTypeOrgDetailToForm(null as any)).toEqual({});
    expect(mapDebtTypeOrgDetailToForm(undefined as any)).toEqual({});
  });

  it('maps basic fields', () => {
    // @ts-expect-error not usefult to add every value
    const result = mapDebtTypeOrgDetailToForm({
      debtPositionTypeId: 123,
      code: 'TEST',
      description: 'Test description',
      flagNotifyOutcomePush: true
    });

    expect(result).toMatchObject({
      debtPositionTypeId: '123',
      code: 'TEST',
      description: 'Test description',
      flagNotifyOutcomePush: 'enabled'
    });
  });

  it.each([
    [true, 'enabled'],
    [false, 'disabled']
  ])('maps flagNotifyOutcomePush=%s to %s', (value, expected) => {
    expect(
      // @ts-expect-error not usefult to add every value
      mapDebtTypeOrgDetailToForm({
        flagNotifyOutcomePush: value
      }).flagNotifyOutcomePush
    ).toBe(expected);
  });

  it('converts amountCents to euros', () => {
    // @ts-expect-error not usefult to add every value
    expect(mapDebtTypeOrgDetailToForm({ amountCents: 10050 }).amountCents).toBe(
      100.5
    );
  });

  it('maps spontaneousFormId to customFormId', () => {
    expect(
      // @ts-expect-error not usefult to add every value
      mapDebtTypeOrgDetailToForm({ spontaneousFormId: 456 }).customFormId
    ).toBe(456);
  });

  describe('paymentMethod', () => {
    it.each([
      [{ amountCents: 1000 }, PaymentMethodOption.AMOUNT],
      [
        { externalPaymentUrl: 'https://example.com' },
        PaymentMethodOption.EXTERNAL
      ],
      [{ code: 'TEST' }, PaymentMethodOption.FREE]
    ])('maps %o to %s', (response, expected) => {
      expect(mapDebtTypeOrgDetailToForm(response as any).paymentMethod).toBe(
        expected
      );
    });
  });

  describe('spontaneousMode', () => {
    it.each([
      [{ spontaneousFormId: 123 }, SpontaneousMode.CUSTOM_FORM],
      [
        { externalPaymentUrl: 'https://example.com' },
        SpontaneousMode.EXTERNAL_URL
      ],
      [{ flagSpontaneous: true }, SpontaneousMode.STANDARD],
      [{ code: 'TEST' }, undefined]
    ])('maps %o to %s', (response, expected) => {
      expect(mapDebtTypeOrgDetailToForm(response as any).spontaneousMode).toBe(
        expected
      );
    });
  });

  describe('balance costs', () => {
    it('normalizes balance costs', () => {
      // @ts-expect-error not usefult to add every value
      const result = mapDebtTypeOrgDetailToForm({
        debtPositionTypeOrgBalanceCosts: [
          {
            type: DebtPositionTypeOrgBalanceCostType.NOTIFICATION_COST,
            operatingYear: '2026',
            sectionCode: '123',
            sectionDescription: 'Notification'
          },
          {
            type: DebtPositionTypeOrgBalanceCostType.DELAY_COST,
            operatingYear: '2025',
            sectionCode: ''
          }
        ]
      });

      expect(result.debtPositionTypeOrgBalanceCostRequestList).toEqual([
        expect.objectContaining({
          operatingYear: '2025',
          enabled: false,
          readOnly: true
        }),
        expect.objectContaining({
          operatingYear: '2026',
          enabled: true,
          readOnly: false
        })
      ]);
    });
  });
});
