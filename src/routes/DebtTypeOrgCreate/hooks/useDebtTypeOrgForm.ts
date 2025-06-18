import { zodResolver } from '@hookform/resolvers/zod';
import { ZodError } from 'zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  createDebtPositionTypeOrg,
  CreateDebtPositionTypeOrg,
  updateDebtPositionTypeOrg,
  getDebtPositionTypeOrgById
} from '../../../api/debtPositionsTypeOrg';
import { DebtTypeOrgForm } from '../types';
import { useApiOperations } from './useApiOperations';
import { useFormSchemas } from './useFormSchemas';
import { useStore } from '../../../store/GlobalStore';
import { OperatorsSelection } from '../../../../generated/apiClient';
import { PaymentMethodOption } from '../steps/Step2Behaviour/components/PaymentMethodSelector';
import utils from '../../../utils';
import { useDebtTypeOrgId } from '../../../hooks/useDebtTypeOrgId';
import { useTranslation } from 'react-i18next';

// Error messages
const ERROR_MESSAGES = {
  INVALID_ID: 'errors.invalidId',
  GENERIC: 'errors.generic',
  VALIDATION: 'errors.validation'
} as const;

type UseDebtTypeOrgFormParams = {
  edit: boolean;
  onSuccess: (description: string) => void;
};

export const useDebtTypeOrgForm = ({
  edit,
  onSuccess
}: UseDebtTypeOrgFormParams) => {
  const {
    state: { organizationId }
  } = useStore();
  const { t } = useTranslation();

  const debtPositionTypeOrgId = useDebtTypeOrgId(edit);
  const { stepSchemas, combinedSchema } = useFormSchemas();

  const debtTypeCreate = createDebtPositionTypeOrg();
  const debtTypeUpdate = updateDebtPositionTypeOrg();

  const { data: originalDataQuery } = getDebtPositionTypeOrgById({
    organizationId,
    debtPositionTypeOrgId: Number(debtPositionTypeOrgId)
  });

  const { createRequestPayload } = useApiOperations(organizationId);

  const methods = useForm<DebtTypeOrgForm>({
    defaultValues: {
      debtPositionTypeId: '',
      code: '',
      description: '',
      iban: '',
      operatorsSelection: OperatorsSelection.ALL,
      paymentMethod: PaymentMethodOption.FREE,
      enabledOperators: [],
      flagNotifyOutcomePush: 'disabled',
      notifyOutcomePushOrgSilServiceId: undefined,
      amountActualizationOrgSilServiceId: undefined
    },
    resolver: zodResolver(combinedSchema),
    mode: 'onTouched'
  });

  const validateStep = useCallback(
    (step: number, values: DebtTypeOrgForm) => {
      try {
        stepSchemas[step].parse(values);
        return { isValid: true, errors: [] };
      } catch (error) {
        if (error instanceof ZodError) {
          return { isValid: false, errors: error.errors };
        }
        return { isValid: false, errors: [] };
      }
    },
    [stepSchemas]
  );

  const performMutation = async (payload: CreateDebtPositionTypeOrg) => {
    if (edit && debtPositionTypeOrgId) {
      const updatePayload = {
        organizationId: payload.organizationId,
        debtPositionTypeOrgId,
        data: payload.data
      };
      return debtTypeUpdate.mutateAsync(updatePayload);
    }
    return debtTypeCreate.mutateAsync(payload);
  };

  /**
   * Handles submission of the debt type organization form.
   * @param formData - The form data to submit.
   */
  const handleSubmit = async (formData: DebtTypeOrgForm): Promise<void> => {
    if (edit && !debtPositionTypeOrgId) {
      utils.notify.emit(t(ERROR_MESSAGES.INVALID_ID));
      return;
    }

    try {
      const originalData = originalDataQuery?.response;

      const requestPayload = await createRequestPayload(
        formData,
        originalData,
        edit
      );
      const response = await performMutation(requestPayload);
      onSuccess(response.description);
    } catch (error) {
      console.error('Operation failed:', error);
      utils.notify.emit(t(ERROR_MESSAGES.GENERIC));
    }
  };

  return {
    methods,
    validateStep,
    handleSubmit
  };
};
