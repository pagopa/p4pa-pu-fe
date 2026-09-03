import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useStep3ApiOperations } from './useStep3ApiOperations';
import { UseMutationResult } from '@tanstack/react-query';
import {
  DebtPositionDTO,
  DebtPositionDetailDTO,
  ManageDebtPositionDTO,
  DebtPositionStatus,
  DebtPositionOrigin,
  PaymentOptionType
} from '../../generated/core/data-contracts';
import {
  Step1Data,
  Step2Data,
  Step3Data,
  DebtPositionTypeEnum
} from '../models/DebtPositionType';
import { Step3FormValues } from '../models/Step3Schema';
import { PageRoutes } from '../routes';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('../utils', async () => {
  const actual = await vi.importActual<typeof import('../utils')>('../utils');
  return {
    ...actual,
    default: {
      ...actual.default,
      notify: {
        emit: vi.fn()
      },
      formatters: {
        ...actual.default.formatters,
        euroToCents: vi.fn(
          (value: string) => parseFloat(value.replace(',', '.')) * 100
        )
      }
    }
  };
});

vi.mock('../models/Step3Schema', () => ({
  convertFormDataToManageDebtPositionDTO: vi.fn()
}));

vi.mock('../utils/paymentUtility', () => ({
  DEFAULT_VALUES: {
    FLAG_IUV_VOLATILE: false,
    MULTI_DEBTOR: false,
    FLAG_PAGO_PA_PU_PAYMENT: true,
    PAYMENT_OPTION_INDEX: 0
  },
  createInstallmentObject: vi.fn(() => ({
    installmentIndex: 1,
    amount: 100,
    dueDate: '2023-12-31'
  })),
  createSingleInstallmentObject: vi.fn(() => ({
    installmentIndex: 0,
    amount: 100,
    dueDate: '2023-12-31'
  }))
}));

describe('useStep3ApiOperations', () => {
  const mockStep1Data: Step1Data = {
    description: { value: 'Test Description', readonly: false },
    debtPositionType: {
      value: '123',
      flagMandatoryDueDate: false,
      readonly: false
    }
  };

  const mockStep2Data: Step2Data = {
    subjectType: { value: 'individual', readonly: false },
    taxCode: { value: 'RSSMRA85M01H501Z', readonly: false },
    fullName: { value: 'Mario Rossi', readonly: false },
    address: { value: 'Via Roma 1', readonly: false },
    civicNumber: { value: '1', readonly: false },
    zipCode: { value: '00100', readonly: false },
    country: { value: 'Italia', readonly: false },
    province: { value: 'RM', readonly: false },
    city: { value: 'Roma', readonly: false }
  };

  const mockDebtPositionDetail: DebtPositionDetailDTO = {
    debtor: {
      taxCode: 'RSSMRA85M01H501Z',
      fullName: 'Mario Rossi'
    },
    debtPositionTypeOrgDescription: 'Test Type',
    debtPositionTypeOrgCode: 'TEST',
    status: DebtPositionStatus.DRAFT,
    paymentOptions: [
      {
        paymentOptionId: 1,
        totalAmountCents: 10000,
        paymentOptionType: PaymentOptionType.SINGLE_INSTALLMENT,
        installments: []
      }
    ]
  } as unknown as DebtPositionDetailDTO;

  const mockFormValues: Step3FormValues = {
    paymentObject: { value: 'Test Payment Object', readonly: false },
    paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
    amount: { value: '100.00', readonly: false },
    dueDate: { value: null, readonly: false },
    isMultibeneficiary: { value: false, readonly: false },
    installments: []
  };

  const mockFormattedData: Step3Data = {
    paymentObject: { value: 'Test Payment Object', readonly: false },
    paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
    amount: { value: '100.00', readonly: false },
    dueDate: { value: null, readonly: false },
    flagMandatoryDueDate: false,
    isMultibeneficiary: { value: false, readonly: false },
    installments: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleEditModeFlow', () => {
    it('should successfully handle edit mode flow with publish', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        debtPositionId: 1,
        status: DebtPositionStatus.UNPAID
      });

      const mockManageInstallmentsMutation = {
        mutateAsync: mockMutateAsync
      } as unknown as UseMutationResult<
        DebtPositionDTO,
        Error,
        {
          organizationId: number;
          debtPositionId: number;
          body: ManageDebtPositionDTO;
          publish?: boolean;
        }
      >;

      const { convertFormDataToManageDebtPositionDTO } = await import(
        '../models/Step3Schema'
      );
      vi.mocked(convertFormDataToManageDebtPositionDTO).mockReturnValue({
        paymentOptionId: 1,
        installments: []
      } as ManageDebtPositionDTO);

      const { result } = renderHook(() => useStep3ApiOperations());

      await act(async () => {
        await result.current.handleEditModeFlow({
          values: mockFormValues,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          debtPositionId: '1',
          debtPositionDetail: mockDebtPositionDetail,
          shouldPublish: true,
          isDraftInEdit: true,
          organizationId: 123,
          manageInstallmentsMutation: mockManageInstallmentsMutation
        });
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        organizationId: 123,
        debtPositionId: 1,
        body: { paymentOptionId: 1, installments: [] },
        publish: true
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED,
        {
          state: {
            debtPositionId: 1,
            status: DebtPositionStatus.UNPAID,
            isEditing: true,
            wasPublished: true
          },
          replace: true
        }
      );
    });

    it('should handle missing payment option error', async () => {
      const utils = await import('../utils');

      const invalidDebtPositionDetail: DebtPositionDetailDTO = {
        debtor: {
          taxCode: 'RSSMRA85M01H501Z',
          fullName: 'Mario Rossi'
        },
        debtPositionTypeOrgDescription: 'Test Type',
        debtPositionTypeOrgCode: 'TEST',
        status: DebtPositionStatus.DRAFT,
        paymentOptions: []
      } as unknown as DebtPositionDetailDTO;

      const mockManageInstallmentsMutation = {
        mutateAsync: vi.fn()
      } as unknown as UseMutationResult<
        DebtPositionDTO,
        Error,
        {
          organizationId: number;
          debtPositionId: number;
          body: ManageDebtPositionDTO;
          publish?: boolean;
        }
      >;

      const { result } = renderHook(() => useStep3ApiOperations());

      await act(async () => {
        await result.current.handleEditModeFlow({
          values: mockFormValues,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          debtPositionId: '1',
          debtPositionDetail: invalidDebtPositionDetail,
          shouldPublish: false,
          isDraftInEdit: false,
          organizationId: 123,
          manageInstallmentsMutation: mockManageInstallmentsMutation
        });
      });

      expect(utils.default.notify.emit).toHaveBeenCalledWith(
        'debtPositionCreateWizard.step3.error.missingPaymentOption',
        'error'
      );
    });

    it('should handle invalid debt position ID', async () => {
      const utils = await import('../utils');

      const mockManageInstallmentsMutation = {
        mutateAsync: vi.fn()
      } as unknown as UseMutationResult<
        DebtPositionDTO,
        Error,
        {
          organizationId: number;
          debtPositionId: number;
          body: ManageDebtPositionDTO;
          publish?: boolean;
        }
      >;

      const { result } = renderHook(() => useStep3ApiOperations());

      await act(async () => {
        await result.current.handleEditModeFlow({
          values: mockFormValues,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          debtPositionId: 'invalid-id',
          debtPositionDetail: mockDebtPositionDetail,
          shouldPublish: false,
          isDraftInEdit: false,
          organizationId: 123,
          manageInstallmentsMutation: mockManageInstallmentsMutation
        });
      });

      expect(utils.default.notify.emit).toHaveBeenCalledWith(
        'debtPositionCreateWizard.errorMissingId',
        'error'
      );
    });

    it('should navigate to error page on mutation failure', async () => {
      const mockMutateAsync = vi.fn().mockRejectedValue(new Error('API Error'));

      const mockManageInstallmentsMutation = {
        mutateAsync: mockMutateAsync
      } as unknown as UseMutationResult<
        DebtPositionDTO,
        Error,
        {
          organizationId: number;
          debtPositionId: number;
          body: ManageDebtPositionDTO;
          publish?: boolean;
        }
      >;

      const { convertFormDataToManageDebtPositionDTO } = await import(
        '../models/Step3Schema'
      );
      vi.mocked(convertFormDataToManageDebtPositionDTO).mockReturnValue({
        paymentOptionId: 1,
        installments: []
      } as ManageDebtPositionDTO);

      const { result } = renderHook(() => useStep3ApiOperations());

      await act(async () => {
        await result.current.handleEditModeFlow({
          values: mockFormValues,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          debtPositionId: '1',
          debtPositionDetail: mockDebtPositionDetail,
          shouldPublish: false,
          isDraftInEdit: false,
          organizationId: 123,
          manageInstallmentsMutation: mockManageInstallmentsMutation
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });
  });

  describe('handleCreateModeFlow', () => {
    it('should successfully create a single installment debt position', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        response: {
          debtPositionId: 1,
          status: DebtPositionStatus.UNPAID
        },
        paymentObject: 'Test Payment Object'
      });

      const mockCreateDebtPositionMutation = {
        mutateAsync: mockMutateAsync
      } as unknown as UseMutationResult<
        { response: DebtPositionDTO; paymentObject?: string },
        Error,
        { body: DebtPositionDTO; paymentObject?: string }
      >;

      const { result } = renderHook(() => useStep3ApiOperations());

      await act(async () => {
        await result.current.handleCreateModeFlow({
          formattedData: mockFormattedData,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          isInstallment: false,
          isDraft: false,
          organizationId: 123,
          createDebtPositionMutation: mockCreateDebtPositionMutation
        });
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        body: expect.objectContaining({
          description: 'Test Description',
          status: DebtPositionStatus.UNPAID,
          organizationId: 123,
          debtPositionTypeOrgId: 123,
          debtPositionOrigin: DebtPositionOrigin.ORDINARY,
          paymentOptions: expect.arrayContaining([
            expect.objectContaining({
              totalAmountCents: 10000,
              paymentOptionType: PaymentOptionType.SINGLE_INSTALLMENT
            })
          ])
        }),
        paymentObject: 'Test Description'
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED,
        {
          state: {
            description: 'Test Payment Object',
            status: DebtPositionStatus.UNPAID,
            debtPositionId: 1,
            isEditing: false,
            wasPublished: true
          },
          replace: true
        }
      );
    });

    it('should successfully create an installment debt position as draft', async () => {
      const mockInstallmentData: Step3Data = {
        paymentObject: { value: 'Test Payment Object', readonly: false },
        paymentOption: {
          value: DebtPositionTypeEnum.INSTALLMENTS,
          readonly: false
        },
        amount: { value: '300.00', readonly: false },
        dueDate: { value: null, readonly: false },
        flagMandatoryDueDate: false,
        isMultibeneficiary: { value: false, readonly: false },
        installments: [
          {
            amount: '100.00',
            dueDate: '2023-12-31',
            remittance: 'Rata 1',
            isMultibeneficiary: false,
            beneficiaries: []
          },
          {
            amount: '200.00',
            dueDate: '2024-01-31',
            remittance: 'Rata 2',
            isMultibeneficiary: false,
            beneficiaries: []
          }
        ]
      };

      const mockMutateAsync = vi.fn().mockResolvedValue({
        response: {
          debtPositionId: 2,
          status: DebtPositionStatus.DRAFT
        },
        paymentObject: 'Test Installment Payment Object'
      });

      const mockCreateDebtPositionMutation = {
        mutateAsync: mockMutateAsync
      } as unknown as UseMutationResult<
        { response: DebtPositionDTO; paymentObject?: string },
        Error,
        { body: DebtPositionDTO; paymentObject?: string }
      >;

      const { result } = renderHook(() => useStep3ApiOperations());

      await act(async () => {
        await result.current.handleCreateModeFlow({
          formattedData: mockInstallmentData,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          isInstallment: true,
          isDraft: true,
          organizationId: 123,
          createDebtPositionMutation: mockCreateDebtPositionMutation
        });
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        body: expect.objectContaining({
          status: DebtPositionStatus.DRAFT,
          paymentOptions: expect.arrayContaining([
            expect.objectContaining({
              paymentOptionType: PaymentOptionType.INSTALLMENTS,
              description:
                'debtPositionCreateWizard.step3.paymentOption.installments'
            })
          ])
        }),
        paymentObject: 'Test Description'
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED,
        {
          state: {
            description: 'Test Installment Payment Object',
            status: DebtPositionStatus.DRAFT,
            debtPositionId: 2,
            isEditing: false,
            wasPublished: false
          },
          replace: true
        }
      );
    });

    it('should navigate to error page on creation failure', async () => {
      const mockMutateAsync = vi
        .fn()
        .mockRejectedValue(new Error('Creation Error'));

      const mockCreateDebtPositionMutation = {
        mutateAsync: mockMutateAsync
      } as unknown as UseMutationResult<
        { response: DebtPositionDTO; paymentObject?: string },
        Error,
        { body: DebtPositionDTO; paymentObject?: string }
      >;

      const { result } = renderHook(() => useStep3ApiOperations());

      await act(async () => {
        await result.current.handleCreateModeFlow({
          formattedData: mockFormattedData,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          isInstallment: false,
          isDraft: false,
          organizationId: 123,
          createDebtPositionMutation: mockCreateDebtPositionMutation
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });
  });

  describe('lastActionWasPublish ref', () => {
    it('should track if the last action was publish in edit mode', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        debtPositionId: 1,
        status: DebtPositionStatus.UNPAID
      });

      const mockManageInstallmentsMutation = {
        mutateAsync: mockMutateAsync
      } as unknown as UseMutationResult<
        DebtPositionDTO,
        Error,
        {
          organizationId: number;
          debtPositionId: number;
          body: ManageDebtPositionDTO;
          publish?: boolean;
        }
      >;

      const { convertFormDataToManageDebtPositionDTO } = await import(
        '../models/Step3Schema'
      );
      vi.mocked(convertFormDataToManageDebtPositionDTO).mockReturnValue({
        paymentOptionId: 1,
        installments: []
      } as ManageDebtPositionDTO);

      const { result } = renderHook(() => useStep3ApiOperations());

      expect(result.current.lastActionWasPublish.current).toBe(false);

      await act(async () => {
        await result.current.handleEditModeFlow({
          values: mockFormValues,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          debtPositionId: '1',
          debtPositionDetail: mockDebtPositionDetail,
          shouldPublish: true,
          isDraftInEdit: true,
          organizationId: 123,
          manageInstallmentsMutation: mockManageInstallmentsMutation
        });
      });

      expect(result.current.lastActionWasPublish.current).toBe(true);
    });

    it('should not set lastActionWasPublish when not publishing or not editing draft', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        debtPositionId: 1,
        status: DebtPositionStatus.UNPAID
      });

      const mockManageInstallmentsMutation = {
        mutateAsync: mockMutateAsync
      } as unknown as UseMutationResult<
        DebtPositionDTO,
        Error,
        {
          organizationId: number;
          debtPositionId: number;
          body: ManageDebtPositionDTO;
          publish?: boolean;
        }
      >;

      const { convertFormDataToManageDebtPositionDTO } = await import(
        '../models/Step3Schema'
      );
      vi.mocked(convertFormDataToManageDebtPositionDTO).mockReturnValue({
        paymentOptionId: 1,
        installments: []
      } as ManageDebtPositionDTO);

      const { result } = renderHook(() => useStep3ApiOperations());

      await act(async () => {
        await result.current.handleEditModeFlow({
          values: mockFormValues,
          step1Data: mockStep1Data,
          step2Data: mockStep2Data,
          debtPositionId: '1',
          debtPositionDetail: mockDebtPositionDetail,
          shouldPublish: false,
          isDraftInEdit: false,
          organizationId: 123,
          manageInstallmentsMutation: mockManageInstallmentsMutation
        });
      });

      expect(result.current.lastActionWasPublish.current).toBe(false);
    });
  });
});
