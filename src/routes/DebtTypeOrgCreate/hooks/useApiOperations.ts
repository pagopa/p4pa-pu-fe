import { useCallback } from 'react';
import { CreateDebtPositionTypeOrg } from '../../../api/debtPositionsTypeOrg';
import {
  DebtTypeOrgForm,
  PaymentMethodOption,
  SpontaneousMode
} from '../types';
import { euroToCents } from '../../../utils/formatters';
import { DebtPositionTypeOrgBalanceCostDTO } from '@generated/core/data-contracts';

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
        ...(data.spontaneousMode === SpontaneousMode.CUSTOM_FORM &&
          data.customFormId && {
            spontaneousFormId: data.customFormId
          }),
        ...(data.paymentMethod === PaymentMethodOption.AMOUNT &&
          data.amountCents && {
            amountCents: euroToCents(data.amountCents)
          }),
        ...(data.flagPresetAmount &&
          data.amountCents && {
            amountCents: euroToCents(data.amountCents)
          }),
        ...((data.paymentMethod === PaymentMethodOption.EXTERNAL ||
          data.spontaneousMode === SpontaneousMode.EXTERNAL_URL) &&
          data.externalPaymentUrl && {
            externalPaymentUrl: data.externalPaymentUrl
          }),
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

        flagAmountActualization: false
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

      const debtPositionTypeOrgBalanceCostRequestList =
        data.debtPositionTypeOrgBalanceCostRequestList?.reduce<
          Array<DebtPositionTypeOrgBalanceCostDTO>
        >(
          (acc, item) => [
            ...acc,
            {
              assessmentCode: item?.enabled ? item?.assessmentCode : '',
              assessmentDescription: item?.enabled
                ? item?.assessmentDescription
                : '',
              officeCode: item?.enabled ? item?.officeCode : '',
              officeDescription: item?.enabled ? item?.officeDescription : '',
              operatingYear: item.operatingYear,
              sectionCode: item?.enabled ? item?.sectionCode : '',
              sectionDescription: item?.enabled ? item?.sectionDescription : '',
              type: item.type
            }
          ],
          []
        );

      const baseRequest: CreateDebtPositionTypeOrg = {
        organizationId,
        data: {
          debtPositionTypeOrg: debtPositionTypeOrgPayload,
          operatorsSelection: data.operatorsSelection,
          enabledOperators: data.enabledOperators || [],
          disabledOperators: data.disabledOperators || [],
          debtPositionTypeOrgBalanceCostRequestList
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
