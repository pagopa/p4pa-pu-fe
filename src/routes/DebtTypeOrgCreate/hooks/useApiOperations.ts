import { useCallback } from 'react';
import { OperatorsSelection } from '../../../../generated/apiClient';
import { CreateDebtPositionTypeOrg } from '../../../api/debtPositionsTypeOrg';
import { PaymentMethodOption } from '../steps/Step2Behaviour/components/PaymentMethodSelector';
import { DebtTypeOrgForm } from '../types';

export const useApiOperations = (organizationId: number) => {
  const createRequestPayload = useCallback(
    async (data: DebtTypeOrgForm): Promise<CreateDebtPositionTypeOrg> => {
      const xsdDefinitionRef =
        data.paymentMethod === PaymentMethodOption.CUSTOM &&
        data.xsdDefinitionRef
          ? await data.xsdDefinitionRef.text()
          : undefined;

      const baseRequest: CreateDebtPositionTypeOrg = {
        organizationId,
        data: {
          debtPositionTypeOrg: {
            ...data,
            debtPositionTypeId: Number(data.debtPositionTypeId),
            organizationId,
            flagNotifyOutcomePush: data.flagNotifyOutcomePush === 'enabled',
            xsdDefinitionRef
          },
          operatorsSelection: data.operatorsSelection,
          // Conditionally include enabledOperators using spread
          ...(data.operatorsSelection === OperatorsSelection.SELECTED &&
            data.enabledOperators?.length && {
              enabledOperators: data.enabledOperators
            })
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
