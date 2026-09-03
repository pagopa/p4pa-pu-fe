import { zodResolver } from '@hookform/resolvers/zod';
import { ZodError, z } from 'zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  createDebtPositionTypeOrg,
  CreateDebtPositionTypeOrg,
  updateDebtPositionTypeOrg,
  getDebtPositionTypeOrgById
} from '../../../api/debtPositionsTypeOrg';
import {
  DebtTypeOrgForm,
  FormBalanceCostList,
  PaymentMethodOption,
  SpontaneousMode
} from '../types';
import { useApiOperations } from './useApiOperations';
import { useFormSchemas } from './useFormSchemas';
import { useStore } from '../../../store/GlobalStore';
import utils from '../../../utils';
import { useDebtTypeOrgId } from '../../../hooks/useDebtTypeOrgId';
import { useTranslation } from 'react-i18next';
import { debtPositionTypeOrgDTOSchema } from '@generated/zod-schema';
import {
  DebtPositionTypeOrgBalanceCostDTO,
  DebtPositionTypeOrgBalanceCostType,
  OperatorsSelection
} from '@generated/data-contracts';

const ERROR_MESSAGES = {
  INVALID_ID: 'errors.invalidId',
  GENERIC: 'errors.generic',
  VALIDATION: 'errors.validation'
} as const;

type DebtPositionTypeOrgResponse = z.infer<typeof debtPositionTypeOrgDTOSchema>;

const balanceCostsNormalize = (
  debtPositionTypeOrgBalanceCosts?: Array<DebtPositionTypeOrgBalanceCostDTO>
) => {
  const currentYear = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Rome',
      year: 'numeric'
    }).format(new Date())
  );

  return debtPositionTypeOrgBalanceCosts
    ? [...debtPositionTypeOrgBalanceCosts]
        ?.sort(
          (costA, costB) =>
            Number(costA.operatingYear) - Number(costB.operatingYear)
        )
        ?.reduce<FormBalanceCostList>(
          (acc, cost) => [
            ...acc,
            {
              ...cost,
              enabled: !!cost.sectionCode,
              readOnly: Number(cost.operatingYear) < Number(currentYear)
            }
          ],
          []
        )
    : [];
};

export const mapDebtTypeOrgDetailToForm = (
  response: DebtPositionTypeOrgResponse
): Partial<DebtTypeOrgForm> => {
  if (!response) return {};

  const {
    debtPositionTypeId,
    flagNotifyOutcomePush,
    amountCents,
    spontaneousFormId,
    debtPositionTypeOrgBalanceCosts,
    ...rest
  } = response;

  const mapped: Partial<DebtTypeOrgForm> = {
    // Spread compatible properties
    ...(rest as Partial<DebtTypeOrgForm>),
    // Normalize ids to string as the form expects string
    debtPositionTypeId:
      debtPositionTypeId != null ? String(debtPositionTypeId) : '',
    // Convert booleans to the radio-friendly value
    flagNotifyOutcomePush: flagNotifyOutcomePush ? 'enabled' : 'disabled',
    // Euro amount from cents
    amountCents:
      typeof amountCents === 'number' ? amountCents / 100 : undefined,
    // Custom form id mapping
    customFormId: spontaneousFormId,
    // Default values / derived values
    flagPresetAmount:
      (response as { flagPresetAmount?: boolean }).flagPresetAmount ??
      (amountCents != null ? true : undefined),
    debtPositionTypeOrgBalanceCostRequestList: balanceCostsNormalize(
      debtPositionTypeOrgBalanceCosts
    )
  };

  // Derive payment method (order of precedence mirrors existing UI logic)
  if (amountCents) {
    mapped.paymentMethod = PaymentMethodOption.AMOUNT;
  } else if (response.externalPaymentUrl) {
    mapped.paymentMethod = PaymentMethodOption.EXTERNAL;
  } else {
    mapped.paymentMethod = PaymentMethodOption.FREE;
  }

  // Derive spontaneous mode
  if (spontaneousFormId) {
    mapped.spontaneousMode = SpontaneousMode.CUSTOM_FORM;
  } else if (response.externalPaymentUrl) {
    mapped.spontaneousMode = SpontaneousMode.EXTERNAL_URL;
  } else if (response.flagSpontaneous) {
    mapped.spontaneousMode = SpontaneousMode.STANDARD;
  } else {
    mapped.spontaneousMode = undefined;
  }

  return mapped;
};

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

  const currentYear = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Rome',
      year: 'numeric'
    }).format(new Date())
  );
  const YEARS = [currentYear - 1, currentYear, currentYear + 1].map(String);

  const balanceCostTypes = Object.values(DebtPositionTypeOrgBalanceCostType);

  const defaultBalanceCost = YEARS.flatMap((operatingYear) =>
    balanceCostTypes.map((type) => ({
      type,
      operatingYear,
      sectionCode: ''
    }))
  );

  const debtPositionTypeOrgId = useDebtTypeOrgId(edit);
  const { stepSchemas, combinedSchema } = useFormSchemas(edit);

  const debtTypeCreate = createDebtPositionTypeOrg();
  const debtTypeUpdate = updateDebtPositionTypeOrg();

  const { data: originalDataQuery, isLoading: isDetailLoading } =
    getDebtPositionTypeOrgById({
      organizationId,
      debtPositionTypeOrgId: Number(debtPositionTypeOrgId)
    });

  const { createRequestPayload } = useApiOperations(organizationId);

  const methods = useForm<DebtTypeOrgForm>({
    defaultValues: {
      debtPositionTypeId: '',
      code: '',
      description: '',
      taxonomyCode: '',
      flagSpontaneous: false,
      spontaneousMode: undefined,
      customFormId: undefined,
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagPresetAmount: false,
      iban: '',
      debtPositionTypeOrgBalanceCostRequestList: defaultBalanceCost,
      operatorsSelection: OperatorsSelection.ALL,
      paymentMethod: PaymentMethodOption.FREE,
      enabledOperators: [],
      flagNotifyOutcomePush: 'disabled',
      notifyOutcomePushOrgSilServiceId: undefined,
      amountActualizationOrgSilServiceId: undefined
    },
    resolver: zodResolver(combinedSchema),
    mode: 'onSubmit'
  });

  // Populate form on edit when detail query is ready
  useEffect(() => {
    if (!edit) return;
    const response = originalDataQuery?.response;
    if (!response || isDetailLoading) return;

    const mappedValues = mapDebtTypeOrgDetailToForm(response);
    methods.reset(
      {
        ...methods.getValues(),
        ...mappedValues
      },
      { keepDefaultValues: true }
    );
  }, [edit, originalDataQuery?.response, isDetailLoading, methods]);

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
