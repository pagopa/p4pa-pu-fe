import { useCallback } from 'react';
import { CreateDebtPositionTypeOrg } from '../../../api/debtPositionsTypeOrg';
import { PaymentMethodOption } from '../steps/Step2Behaviour/components/PaymentMethodSelector';
import { DebtTypeOrgForm } from '../types';

export const useApiOperations = (organizationId: number) => {
  const createRequestPayload = useCallback(
    async (data: DebtTypeOrgForm): Promise<CreateDebtPositionTypeOrg> => {
      // File Blob to string
      const xsdDefinitionRef =
        data.paymentMethod === PaymentMethodOption.CUSTOM &&
        data.xsdDefinitionRef
          ? await data.xsdDefinitionRef.text()
          : undefined;

      const {
        operatorsSelection,
        enabledOperators,
        disabledOperators,
        ...rest
      } = data;

      const baseRequest: CreateDebtPositionTypeOrg = {
        organizationId,
        data: {
          debtPositionTypeOrg: {
            ...rest,
            debtPositionTypeId: Number(data.debtPositionTypeId),
            organizationId,
            flagNotifyOutcomePush: data.flagNotifyOutcomePush === 'enabled',
            xsdDefinitionRef
          },
          operatorsSelection,
          enabledOperators,
          disabledOperators
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
