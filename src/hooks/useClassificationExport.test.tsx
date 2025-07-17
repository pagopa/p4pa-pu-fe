import { describe, expect, it } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import {
  useClassificationExport,
  ClassificationFormFields
} from './useClassificationExport';
import { ExportFileTypeEnum, LabelEnum } from '../../generated/apiClient';

describe('useClassificationExport', () => {
  const mockOrganizationId = 123;

  const createEmptyFormData = (): ClassificationFormFields => ({
    fileVersion: '',
    label: '',
    iuv: '',
    iud: '',
    iuf: '',
    iur: '',
    remittanceInformation: '',
    accountRegistryCode: '',
    billAmountCents: '',
    reportingIur: '',
    pspLastName: '',
    pspCompanyName: '',
    regulationUniqueIdentifier: ''
  });

  const createEmptyDateRanges = () => ({
    classification: { from: null, to: null },
    payment: { from: null, to: null },
    reporting: { from: null, to: null },
    accounting: { from: null, to: null },
    value: { from: null, to: null },
    payDate: { from: null, to: null }
  });

  describe('Form Management', () => {
    it('should initialize form with default values', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const defaultValues = result.current.formMethods.getValues();

      expect(defaultValues).toEqual({
        fileVersion: '',
        label: '',
        iuv: '',
        remittanceInformation: '',
        iur: '',
        iud: '',
        iuf: '',
        reportingIur: '',
        billAmountCents: '',
        accountRegistryCode: '',
        pspLastName: '',
        pspCompanyName: '',
        regulationUniqueIdentifier: ''
      });
    });

    it('should allow setting form values', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const testValues: Partial<ClassificationFormFields> = {
        fileVersion: 'v1.0',
        label: LabelEnum.DOPPI,
        iuv: 'IUV123456'
      };

      act(() => {
        result.current.formMethods.setValue(
          'fileVersion',
          testValues.fileVersion!
        );
        result.current.formMethods.setValue('label', testValues.label!);
        result.current.formMethods.setValue('iuv', testValues.iuv!);
      });

      const formValues = result.current.formMethods.getValues();
      expect(formValues.fileVersion).toBe(testValues.fileVersion);
      expect(formValues.label).toBe(testValues.label);
      expect(formValues.iuv).toBe(testValues.iuv);
    });
  });

  describe('isValidLabelEnum', () => {
    it('should validate correct LabelEnum values', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      expect(result.current.isValidLabelEnum(LabelEnum.DOPPI)).toBe(true);
      expect(result.current.isValidLabelEnum(LabelEnum.RT_NO_IUF)).toBe(true);
      expect(result.current.isValidLabelEnum(LabelEnum.UNKNOWN)).toBe(true);
    });

    it('should reject invalid LabelEnum values', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      expect(result.current.isValidLabelEnum('INVALID_LABEL')).toBe(false);
      expect(result.current.isValidLabelEnum('')).toBe(false);
      expect(result.current.isValidLabelEnum('random-string')).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should return false when fileVersion is missing', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        label: LabelEnum.DOPPI,
        iuv: 'IUV123'
      };

      const dateRanges = {
        ...createEmptyDateRanges(),
        classification: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31')
        }
      };

      const isValid = result.current.validateForm(formData, dateRanges);
      expect(isValid).toBe(false);
    });

    it('should return true when fileVersion and complete date range are provided', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0'
      };

      const dateRanges = {
        ...createEmptyDateRanges(),
        classification: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31')
        }
      };

      const isValid = result.current.validateForm(formData, dateRanges);
      expect(isValid).toBe(true);
    });

    it('should return true when fileVersion and other criteria are provided', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0',
        label: LabelEnum.DOPPI
      };

      const dateRanges = createEmptyDateRanges();

      const isValid = result.current.validateForm(formData, dateRanges);
      expect(isValid).toBe(true);
    });

    it('should validate various individual criteria', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const baseFormData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0'
      };

      const emptyDateRanges = createEmptyDateRanges();

      const fieldsToTest = [
        { field: 'iuv', value: 'IUV123' },
        { field: 'iur', value: 'IUR123' },
        { field: 'iud', value: 'IUD123' },
        { field: 'iuf', value: 'IUF123' },
        { field: 'remittanceInformation', value: 'Some info' },
        { field: 'billAmountCents', value: '100.50' },
        { field: 'accountRegistryCode', value: 'ACC123' },
        { field: 'pspLastName', value: 'Rossi' },
        { field: 'pspCompanyName', value: 'Company SRL' },
        { field: 'regulationUniqueIdentifier', value: 'REG123' },
        { field: 'reportingIur', value: 'REPORTING123' }
      ];

      fieldsToTest.forEach(({ field, value }) => {
        const testFormData = {
          ...baseFormData,
          [field]: value
        };

        const isValid = result.current.validateForm(
          testFormData,
          emptyDateRanges
        );
        expect(isValid, `Should be valid with ${field} field`).toBe(true);
      });
    });

    it('should handle incomplete date ranges correctly', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0'
      };

      const incompleteDateRanges = {
        ...createEmptyDateRanges(),
        classification: { from: new Date('2024-01-01'), to: null }
      };

      const isValid = result.current.validateForm(
        formData,
        incompleteDateRanges
      );
      expect(isValid).toBe(false);
    });

    it('should return false when only fileVersion is provided without other criteria', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0'
      };

      const emptyDateRanges = createEmptyDateRanges();

      const isValid = result.current.validateForm(formData, emptyDateRanges);
      expect(isValid).toBe(false);
    });
  });

  describe('API Payload Building', () => {
    it('should build correct payload with all form fields', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData: ClassificationFormFields = {
        fileVersion: 'v1.0',
        label: LabelEnum.DOPPI,
        iuv: 'IUV123456',
        iud: 'IUD123456',
        iuf: 'IUF123456',
        iur: 'IUR123456',
        remittanceInformation: 'Test remittance',
        accountRegistryCode: 'ACC123',
        billAmountCents: '100.50',
        reportingIur: '',
        pspLastName: 'Rossi',
        pspCompanyName: 'Company SRL',
        regulationUniqueIdentifier: 'REG123'
      };

      const dateRanges = {
        classification: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31')
        },
        payment: { from: new Date('2024-02-01'), to: new Date('2024-02-28') },
        reporting: { from: new Date('2024-03-01'), to: new Date('2024-03-31') },
        accounting: {
          from: new Date('2024-04-01'),
          to: new Date('2024-04-30')
        },
        value: { from: new Date('2024-05-01'), to: new Date('2024-05-31') }
      };

      const payload = result.current.buildApiPayload(formData, dateRanges);

      expect(payload).toEqual({
        organizationId: mockOrganizationId,
        exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
        fileVersion: 'v1.0',
        filterFields: {
          iuv: ['IUV123456'],
          iud: 'IUD123456',
          iuf: 'IUF123456',
          iur: ['IUR123456'],
          label: [LabelEnum.DOPPI],
          remittanceInformation: 'Test remittance',
          billAmountCents: 10050,
          accountRegistryCode: 'ACC123',
          pspLastName: 'Rossi',
          pspCompanyName: 'Company SRL',
          regulationUniqueIdentifier: 'REG123',
          lastClassificationDate: {
            from: '2024-01-01',
            to: '2024-01-31'
          },
          paymentDate: {
            from: '2024-02-01',
            to: '2024-02-28'
          },
          regulationDate: {
            from: '2024-03-01',
            to: '2024-03-31'
          },
          billDate: {
            from: '2024-04-01',
            to: '2024-04-30'
          },
          regionValueDate: {
            from: '2024-05-01',
            to: '2024-05-31'
          }
        }
      });
    });

    it('should handle payDate field correctly', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0'
      };

      const dateRanges = {
        ...createEmptyDateRanges(),
        payDate: { from: new Date('2024-06-01'), to: new Date('2024-06-30') }
      };

      const payload = result.current.buildApiPayload(formData, dateRanges);

      expect(payload.filterFields.payDate).toEqual({
        from: '2024-06-01',
        to: '2024-06-30'
      });
    });

    it('should prioritize iur over reportingIur when both are provided', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0',
        iur: 'IUR123',
        reportingIur: 'REPORTING_IUR456'
      };

      const emptyDateRanges = createEmptyDateRanges();

      const payload = result.current.buildApiPayload(formData, emptyDateRanges);

      expect(payload.filterFields.iur).toStrictEqual(['IUR123']);
    });

    it('should use reportingIur when iur is empty', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0',
        iur: '',
        reportingIur: 'REPORTING_IUR456'
      };

      const emptyDateRanges = createEmptyDateRanges();

      const payload = result.current.buildApiPayload(formData, emptyDateRanges);

      expect(payload.filterFields.iur).toStrictEqual(['REPORTING_IUR456']);
    });

    it('should use iur when reportingIur is empty', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0',
        iur: 'IUR123',
        reportingIur: ''
      };

      const emptyDateRanges = createEmptyDateRanges();

      const payload = result.current.buildApiPayload(formData, emptyDateRanges);

      expect(payload.filterFields.iur).toStrictEqual(['IUR123']);
    });

    it('should not include iur when both are empty', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0',
        iur: '',
        reportingIur: ''
      };

      const emptyDateRanges = createEmptyDateRanges();

      const payload = result.current.buildApiPayload(formData, emptyDateRanges);

      expect(payload.filterFields.iur).toBeUndefined();
    });

    it('should convert billAmountCents from euros to cents', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0',
        billAmountCents: '123.45'
      };

      const emptyDateRanges = createEmptyDateRanges();

      const payload = result.current.buildApiPayload(formData, emptyDateRanges);

      expect(payload.filterFields.billAmountCents).toBe(12345);
    });

    it('should handle invalid billAmountCents gracefully', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0',
        billAmountCents: 'invalid-amount'
      };

      const emptyDateRanges = createEmptyDateRanges();

      const payload = result.current.buildApiPayload(formData, emptyDateRanges);

      expect(payload.filterFields.billAmountCents).toBeUndefined();
    });

    it('should exclude empty fields from payload', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0'
      };

      const emptyDateRanges = createEmptyDateRanges();

      const payload = result.current.buildApiPayload(formData, emptyDateRanges);

      expect(payload.filterFields).toEqual({});
    });

    it('should handle invalid label enum values', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0',
        label: 'INVALID_LABEL'
      };

      const emptyDateRanges = createEmptyDateRanges();

      const payload = result.current.buildApiPayload(formData, emptyDateRanges);

      expect(payload.filterFields.label).toBeUndefined();
    });

    it('should format dates correctly to ISO string format', () => {
      const { result } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const formData = {
        ...createEmptyFormData(),
        fileVersion: 'v1.0'
      };

      const dateRanges = {
        ...createEmptyDateRanges(),
        classification: {
          from: new Date('2024-01-15T10:30:00.000Z'),
          to: new Date('2024-01-25T15:45:00.000Z')
        }
      };

      const payload = result.current.buildApiPayload(formData, dateRanges);

      expect(payload.filterFields.lastClassificationDate).toEqual({
        from: '2024-01-15',
        to: '2024-01-25'
      });
    });
  });

  describe('Hook Stability', () => {
    it('should maintain reference stability for functions', () => {
      const { result, rerender } = renderHook(() =>
        useClassificationExport(mockOrganizationId)
      );

      const firstRender = {
        validateForm: result.current.validateForm,
        buildApiPayload: result.current.buildApiPayload,
        isValidLabelEnum: result.current.isValidLabelEnum
      };

      rerender();

      const secondRender = {
        validateForm: result.current.validateForm,
        buildApiPayload: result.current.buildApiPayload,
        isValidLabelEnum: result.current.isValidLabelEnum
      };

      expect(firstRender.validateForm).toBe(secondRender.validateForm);
      expect(firstRender.buildApiPayload).toBe(secondRender.buildApiPayload);
      expect(firstRender.isValidLabelEnum).toBe(secondRender.isValidLabelEnum);
    });

    it('should create new buildApiPayload when organizationId changes', () => {
      const { result, rerender } = renderHook(
        ({ orgId }) => useClassificationExport(orgId),
        { initialProps: { orgId: 123 } }
      );

      const firstPayload = result.current.buildApiPayload;

      rerender({ orgId: 456 });

      const secondPayload = result.current.buildApiPayload;

      expect(firstPayload).not.toBe(secondPayload);
    });
  });
});
