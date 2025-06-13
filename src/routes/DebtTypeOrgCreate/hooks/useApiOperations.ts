import { useCallback } from 'react';
import { CreateDebtPositionTypeOrg } from '../../../api/debtPositionsTypeOrg';
import { PaymentMethodOption } from '../steps/Step2Behaviour/components/PaymentMethodSelector';
import { DebtTypeOrgForm } from '../types';

type OriginalDebtTypeOrgData = {
  debtPositionTypeOrgId?: number;
  flagActive?: boolean;
  flagExternal?: boolean;
  creationDate?: string;
  updateDate?: string;
  updateOperatorExternalId?: string;
  updateTraceId?: string;
  debtPositionTypeDescription?: string;
  debtPositionTypeCode?: string;
  notifyOutcomePushOrgSilServiceApplicationName?: string;
  amountActualizationOrgSilServiceApplicationName?: string;
};

export const useApiOperations = (organizationId: number) => {
  const createRequestPayload = useCallback(
    async (
      data: DebtTypeOrgForm,
      originalData?: OriginalDebtTypeOrgData,
      isEdit = false
    ): Promise<CreateDebtPositionTypeOrg> => {
      // File Blob to string
      const xsdDefinitionRef =
        data.paymentMethod === PaymentMethodOption.CUSTOM &&
        data.xsdDefinitionRef
          ? await data.xsdDefinitionRef.text()
          : undefined;

      const basePayload = {
        debtPositionTypeId: Number(data.debtPositionTypeId),
        organizationId,
        description: data.description,
        code: data.code,

        ...(data.iban && { iban: data.iban }),
        ...(data.postalIban && { postalIban: data.postalIban }),
        ...(data.postalAccountCode && {
          postalAccountCode: data.postalAccountCode
        }),
        ...(data.holderPostalCc && { holderPostalCc: data.holderPostalCc }),
        ...(data.balance && { balance: data.balance }),
        ...(data.orgSector && { orgSector: data.orgSector }),

        flagSpontaneous: data.flagSpontaneous || false,
        flagMandatoryDueDate: data.flagMandatoryDueDate || false,
        flagAnonymousFiscalCode: data.flagAnonymousFiscalCode || false,
        flagNotifyIo: data.flagNotifyIo || false,
        flagNotifyOutcomePush: data.flagNotifyOutcomePush === 'enabled',

        ...(data.amountCents && { amountCents: data.amountCents }),
        ...(data.externalPaymentUrl && {
          externalPaymentUrl: data.externalPaymentUrl
        }),
        ...(xsdDefinitionRef && { xsdDefinitionRef }),

        ...(data.serviceId && { serviceId: data.serviceId }),
        ...(data.ioTemplateSubject && {
          ioTemplateSubject: data.ioTemplateSubject
        }),
        ...(data.ioTemplateMessage && {
          ioTemplateMessage: data.ioTemplateMessage
        }),

        ...(data.notifyOutcomePushOrgSilServiceId &&
          data.notifyOutcomePushOrgSilServiceId !== 0 && {
            notifyOutcomePushOrgSilServiceId:
              data.notifyOutcomePushOrgSilServiceId
          }),
        ...(data.amountActualizationOrgSilServiceId &&
          data.amountActualizationOrgSilServiceId !== 0 && {
            amountActualizationOrgSilServiceId:
              data.amountActualizationOrgSilServiceId
          }),

        flagAmountActualization: !!(
          data.amountActualizationOrgSilServiceId &&
          data.amountActualizationOrgSilServiceId !== 0
        )
      };

      const debtPositionTypeOrgPayload =
        isEdit && originalData
          ? {
              ...basePayload,
              debtPositionTypeOrgId: originalData.debtPositionTypeOrgId,
              flagActive: originalData.flagActive,
              flagExternal: originalData.flagExternal
            }
          : basePayload;

      const baseRequest: CreateDebtPositionTypeOrg = {
        organizationId,
        data: {
          debtPositionTypeOrg: debtPositionTypeOrgPayload,
          operatorsSelection: data.operatorsSelection,
          enabledOperators: data.enabledOperators || [],
          disabledOperators: data.disabledOperators || []
        }
      };

      return baseRequest;
    },
    [organizationId]
  );

  return {
    createRequestPayload
  };
};
