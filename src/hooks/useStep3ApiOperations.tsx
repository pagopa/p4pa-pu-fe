import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { UseMutationResult } from '@tanstack/react-query';
import {
  DebtPositionDTO,
  DebtPositionDetailDTO,
  ManageDebtPositionDTO,
  DebtPositionStatus,
  DebtPositionOrigin,
  PaymentOptionTypeEnum
} from '../../generated/data-contracts';
import { PageRoutes } from '../routes';
import {
  Step3FormValues,
  convertFormDataToManageDebtPositionDTO
} from '../models/Step3Schema';
import { Step1Data, Step2Data, Step3Data } from '../models/DebtPositionType';
import {
  DEFAULT_VALUES,
  createInstallmentObject,
  createSingleInstallmentObject
} from '../utils/paymentUtility';
import utils from '../utils';

/**
 * Parameters for the edit operation
 */
export type EditModeFlowParams = {
  values: Step3FormValues;
  step1Data: Step1Data;
  step2Data: Step2Data;
  debtPositionId: string | number;
  debtPositionDetail: DebtPositionDetailDTO;
  shouldPublish: boolean;
  isDraftInEdit: boolean;
  organizationId: number;
  manageInstallmentsMutation: UseMutationResult<
    DebtPositionDTO,
    Error,
    {
      organizationId: number;
      debtPositionId: number;
      body: ManageDebtPositionDTO;
      publish?: boolean;
    }
  >;
};

/**
 * Parameters for the creation operation
 */
export type CreateModeFlowParams = {
  formattedData: Step3Data;
  step1Data: Step1Data;
  step2Data: Step2Data;
  isInstallment: boolean;
  isDraft: boolean;
  organizationId: number;
  createDebtPositionMutation: UseMutationResult<
    { response: DebtPositionDTO; paymentObject?: string },
    Error,
    { body: DebtPositionDTO; paymentObject?: string }
  >;
};

/**
 * Result of the custom hook
 */
export type UseStep3ApiOperationsResult = {
  handleEditModeFlow: (params: EditModeFlowParams) => Promise<void>;
  handleCreateModeFlow: (params: CreateModeFlowParams) => Promise<void>;
  lastActionWasPublish: React.MutableRefObject<boolean>;
};

/**
 * Custom hook to manage the API operations of the Step3 component
 * Extracts the logic for creating and modifying debt positions
 */
export const useStep3ApiOperations = (): UseStep3ApiOperationsResult => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Ref to track if the last action was publish (for the correct title in the completed page)
  const lastActionWasPublish = useRef(false);

  /**
   * Handles the edit flow for managing the installments of the debt position
   */
  const handleEditModeFlow = async (
    params: EditModeFlowParams
  ): Promise<void> => {
    const {
      values,
      step1Data,
      step2Data,
      debtPositionId,
      debtPositionDetail,
      shouldPublish,
      isDraftInEdit,
      organizationId,
      manageInstallmentsMutation
    } = params;

    const firstPaymentOption = debtPositionDetail.paymentOptions?.[0];
    if (!firstPaymentOption?.paymentOptionId) {
      utils.notify.emit(
        t('debtPositionCreateWizard.step3.error.missingPaymentOption'),
        'error'
      );
      return;
    }

    // Validate debtPositionId
    if (!debtPositionId || isNaN(Number(debtPositionId))) {
      console.error('Invalid debtPositionId:', debtPositionId);
      utils.notify.emit(t('debtPositionCreateWizard.errorMissingId'), 'error');
      return;
    }

    try {
      const manageBody = convertFormDataToManageDebtPositionDTO(
        values,
        step2Data,
        firstPaymentOption.paymentOptionId,
        debtPositionDetail,
        step1Data
      );

      const shouldPublishPosition = shouldPublish;
      lastActionWasPublish.current = shouldPublishPosition && isDraftInEdit;

      try {
        const response = await manageInstallmentsMutation.mutateAsync({
          organizationId,
          debtPositionId: Number(debtPositionId),
          body: manageBody,
          publish: shouldPublishPosition
        });

        navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED, {
          state: {
            ...response,
            isEditing: true,
            wasPublished: lastActionWasPublish.current
          },
          replace: true
        });
      } catch (error) {
        console.error(error);
        navigate(PageRoutes.RESPONSES_ERROR);
      }
    } catch (error) {
      console.error('Error converting form data:', error);
      utils.notify.emit(
        t('debtPositionCreateWizard.step3.error.conversionError'),
        'error'
      );
    }
  };

  /**
   * Handles the creation flow for the debt position
   */
  const handleCreateModeFlow = async (
    params: CreateModeFlowParams
  ): Promise<void> => {
    const {
      formattedData,
      step1Data,
      step2Data,
      isInstallment,
      isDraft,
      organizationId,
      createDebtPositionMutation
    } = params;

    const postBody: DebtPositionDTO = {
      description: step1Data?.description.value || '',
      status: isDraft ? DebtPositionStatus.DRAFT : DebtPositionStatus.UNPAID,
      organizationId: organizationId,
      debtPositionTypeOrgId: Number(step1Data?.debtPositionType.value || 0),
      flagIuvVolatile: DEFAULT_VALUES.FLAG_IUV_VOLATILE,
      debtPositionOrigin: DebtPositionOrigin.ORDINARY,
      multiDebtor: DEFAULT_VALUES.MULTI_DEBTOR,
      flagPuPagoPaPayment: DEFAULT_VALUES.FLAG_PAGO_PA_PU_PAYMENT,
      paymentOptions: [
        {
          totalAmountCents: utils.formatters.euroToCents(
            formattedData.amount.value || '0'
          ),
          description: isInstallment
            ? t('debtPositionCreateWizard.step3.paymentOption.installments')
            : t('debtPositionCreateWizard.step3.paymentOption.single'),
          paymentOptionType: isInstallment
            ? PaymentOptionTypeEnum.INSTALLMENTS
            : PaymentOptionTypeEnum.SINGLE_INSTALLMENT,
          paymentOptionIndex: DEFAULT_VALUES.PAYMENT_OPTION_INDEX,
          installments: isInstallment
            ? formattedData.installments?.map((installment) =>
                createInstallmentObject(installment, step2Data, formattedData)
              ) || []
            : [createSingleInstallmentObject(formattedData, step2Data)]
        }
      ]
    };

    try {
      const response = await createDebtPositionMutation.mutateAsync({
        body: postBody,
        paymentObject: postBody.description
      });

      navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED, {
        state: {
          description: response.paymentObject,
          status: response.response?.status,
          debtPositionId: response.response?.debtPositionId,
          isEditing: false,
          wasPublished: !isDraft
        },
        replace: true
      });
    } catch (error) {
      console.error(error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  };

  return {
    handleEditModeFlow,
    handleCreateModeFlow,
    lastActionWasPublish
  };
};
