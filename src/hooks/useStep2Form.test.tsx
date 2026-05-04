import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStep2Form } from './useStep2Form';
import { Step2Data } from '../models/DebtPositionType';
import { SubjectType } from '../utils/fieldValidation';
import { TFunction } from 'i18next';
import { z } from 'zod';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('useStep2Form', () => {
  const mockSetData = vi.fn();

  const createMockSchema = () => {
    return z.object({
      subjectType: z.object({
        value: z.string(),
        readonly: z.boolean()
      }),
      taxCode: z.object({
        value: z.string().optional(),
        readonly: z.boolean()
      }),
      fullName: z.object({
        value: z.string(),
        readonly: z.boolean()
      }),
      address: z.object({
        value: z.string(),
        readonly: z.boolean()
      }),
      civicNumber: z.object({
        value: z.string(),
        readonly: z.boolean()
      }),
      zipCode: z.object({
        value: z.string(),
        readonly: z.boolean()
      }),
      country: z.object({
        value: z.string(),
        readonly: z.boolean()
      }),
      province: z.object({
        value: z.string(),
        readonly: z.boolean()
      }),
      city: z.object({
        value: z.string(),
        readonly: z.boolean()
      }),
      anonymousSubject: z
        .object({
          value: z.boolean(),
          readonly: z.boolean()
        })
        .optional()
    });
  };

  const createBaseData = (): Step2Data => ({
    subjectType: { value: SubjectType.INDIVIDUAL, readonly: false },
    taxCode: { value: '', readonly: false },
    fullName: { value: '', readonly: false },
    address: { value: '', readonly: false },
    civicNumber: { value: '', readonly: false },
    zipCode: { value: '', readonly: false },
    country: { value: 'IT', readonly: false },
    province: { value: '', readonly: false },
    city: { value: '', readonly: false }
  });

  const mockT = ((key: string) => key) as TFunction;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize form with provided data', () => {
      const data = createBaseData();
      const schema = createMockSchema();

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.watch).toBeDefined();
      expect(result.current.errors).toBeDefined();
    });

    it('should initialize country with IT default', () => {
      const data = createBaseData();
      data.country = { value: '', readonly: false };
      const schema = createMockSchema();

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      const countryValue = result.current.watch('country.value');
      expect(countryValue).toBe('IT');
    });

    it('should initialize anonymousSubject with false default', () => {
      const data = createBaseData();
      const schema = createMockSchema();

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      const anonymousValue = result.current.watch('anonymousSubject.value');
      expect(anonymousValue).toBe(false);
    });

    it('should call setData to initialize empty fields in create mode', async () => {
      const data = createBaseData();
      // Remove some fields to test initialization
      delete (data as Partial<Step2Data>).address;
      delete (data as Partial<Step2Data>).civicNumber;
      delete (data as Partial<Step2Data>).zipCode;

      const schema = createMockSchema();

      renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalled();
      });

      const callArg = mockSetData.mock.calls[0][0] as Step2Data;
      expect(callArg.address).toEqual({ value: '', readonly: false });
      expect(callArg.civicNumber).toEqual({ value: '', readonly: false });
      expect(callArg.zipCode).toEqual({ value: '', readonly: false });
    });

    it('should NOT call setData in edit mode', async () => {
      const data = createBaseData();
      const schema = createMockSchema();

      renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: true,
          schema,
          t: mockT
        })
      );

      await waitFor(
        () => {
          expect(mockSetData).not.toHaveBeenCalled();
        },
        { timeout: 100 }
      );
    });
  });

  describe('Edit Mode', () => {
    it('should reset form with edit data when taxCode is present', async () => {
      const data = createBaseData();
      data.taxCode = { value: 'RSSMRA80A01H501U', readonly: true };
      data.fullName = { value: 'Mario Rossi', readonly: true };
      const schema = createMockSchema();

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: true,
          schema,
          t: mockT
        })
      );

      await waitFor(() => {
        const taxCodeValue = result.current.watch('taxCode.value');
        expect(taxCodeValue).toBe('RSSMRA80A01H501U');
      });
    });

    it('should set anonymousSubject to true when fiscalCode is ANONIMO', async () => {
      const data = createBaseData();
      data.taxCode = { value: 'ANONIMO', readonly: true };
      data.anonymousSubject = { value: true, readonly: true };
      const schema = createMockSchema();

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: true,
          schema,
          t: mockT
        })
      );

      await waitFor(() => {
        const anonymousValue = result.current.watch('anonymousSubject.value');
        expect(anonymousValue).toBe(true);
      });
    });
  });

  describe('Form Actions', () => {
    it('should update field value with setValue', async () => {
      const data = createBaseData();
      const schema = createMockSchema();

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      act(() => {
        result.current.setValue('taxCode.value', 'RSSMRA80A01H501U');
      });

      await waitFor(() => {
        const taxCodeValue = result.current.watch('taxCode.value');
        expect(taxCodeValue).toBe('RSSMRA80A01H501U');
      });
    });

    it('should watch field changes', () => {
      const data = createBaseData();
      const schema = createMockSchema();

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      act(() => {
        result.current.setValue('subjectType.value', SubjectType.BUSINESS);
      });

      const subjectTypeValue = result.current.watch('subjectType.value');
      expect(subjectTypeValue).toBe(SubjectType.BUSINESS);
    });
  });

  describe('Error Customization', () => {
    it('should customize taxCode error message for BUSINESS type', async () => {
      const data = createBaseData();
      data.subjectType = { value: SubjectType.BUSINESS, readonly: false };

      const schema = z.object({
        subjectType: z.object({
          value: z.string(),
          readonly: z.boolean()
        }),
        taxCode: z.object({
          value: z
            .string()
            .min(1, 'debtPositionCreateWizard.step2.taxCode.required'),
          readonly: z.boolean()
        }),
        fullName: z.object({ value: z.string(), readonly: z.boolean() }),
        address: z.object({ value: z.string(), readonly: z.boolean() }),
        civicNumber: z.object({ value: z.string(), readonly: z.boolean() }),
        zipCode: z.object({ value: z.string(), readonly: z.boolean() }),
        country: z.object({ value: z.string(), readonly: z.boolean() }),
        province: z.object({ value: z.string(), readonly: z.boolean() }),
        city: z.object({ value: z.string(), readonly: z.boolean() }),
        anonymousSubject: z
          .object({ value: z.boolean(), readonly: z.boolean() })
          .optional()
      });

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      await act(async () => {
        await result.current.trigger('taxCode.value');
      });

      await waitFor(() => {
        expect(result.current.errors.taxCode?.value?.message).toBe(
          'debtPositionCreateWizard.step2.taxCodeBusiness.required'
        );
      });
    });

    it('should customize fullName error message for BUSINESS type', async () => {
      const data = createBaseData();
      data.subjectType = { value: SubjectType.BUSINESS, readonly: false };

      const schema = z.object({
        subjectType: z.object({ value: z.string(), readonly: z.boolean() }),
        taxCode: z.object({
          value: z.string().optional(),
          readonly: z.boolean()
        }),
        fullName: z.object({
          value: z
            .string()
            .min(1, 'debtPositionCreateWizard.step2.fullName.required'),
          readonly: z.boolean()
        }),
        address: z.object({ value: z.string(), readonly: z.boolean() }),
        civicNumber: z.object({ value: z.string(), readonly: z.boolean() }),
        zipCode: z.object({ value: z.string(), readonly: z.boolean() }),
        country: z.object({ value: z.string(), readonly: z.boolean() }),
        province: z.object({ value: z.string(), readonly: z.boolean() }),
        city: z.object({ value: z.string(), readonly: z.boolean() }),
        anonymousSubject: z
          .object({ value: z.boolean(), readonly: z.boolean() })
          .optional()
      });

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      await act(async () => {
        await result.current.trigger('fullName.value');
      });

      await waitFor(() => {
        expect(result.current.errors.fullName?.value?.message).toBe(
          'debtPositionCreateWizard.step2.companyName.required'
        );
      });
    });
  });

  describe('Form Submission State', () => {
    it('should track isSubmitted state', async () => {
      const data = createBaseData();
      const schema = createMockSchema();

      const { result } = renderHook(() =>
        useStep2Form({
          data,
          setData: mockSetData,
          isEditing: false,
          schema,
          t: mockT
        })
      );

      expect(result.current.isSubmitted).toBe(false);

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const noop = () => {};

      await act(async () => {
        await result.current.handleSubmit(noop)();
      });

      expect(result.current.isSubmitted).toBe(true);
    });
  });
});
