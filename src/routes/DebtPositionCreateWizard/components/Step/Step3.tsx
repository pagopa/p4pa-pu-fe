import {
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Controller, useForm, Path, UseFormSetValue } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../../components/Wizard/SectionBox';
import ArticleIcon from '@mui/icons-material/Article';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { useEffect, useRef } from 'react';
import BeneficiaryField from '../Beneficiary/BeneficiaryField';
import InstallmentField from '../Installment/InstallmentField';
import utils from '../../../../utils';
import type {
  Installment,
  PaymentOption
} from '../../../../models/paymentTypes';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { BeneficiaryFieldRef } from '../Beneficiary/BeneficiaryField';
import { useStore } from '../../../../store/GlobalStore';
import {
  Step2Data,
  Step3Data,
  Step1Data,
  DebtPositionTypeEnum
} from '../../../../models/DebtPositionType';
import {
  DEFAULT_VALUES,
  createInstallmentObject,
  createSingleInstallmentObject,
  triggerValidationForAllBeneficiaries,
  syncInstallmentBeneficiaries,
  validateInstallments,
  validateMultiBeneficiary,
  handleInstallmentValidationFailure
} from '../../../../utils/paymentUtility';
import debtPositionsApi from '../../../../api/debtPositions';
import {
  DebtPositionDTO,
  DebtPositionStatus,
  DebtPositionOrigin,
  PaymentOptionTypeEnum
} from '../../../../../generated/data-contracts';
import { PageRoutes } from '../../../../routes';
import {
  createStep3Resolver,
  convertFormValuesToStep3Data,
  Step3FormValues,
  convertFormDataToManageDebtPositionDTO
} from '../../../../models/Step3Schema';

type Props = {
  data: Step3Data;
  setData: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
  step1Data: Step1Data;
  step2Data: Step2Data;
  isEditing?: boolean;
};

/**
 * Checks if there's actual data to populate in the form (not just empty strings)
 */
const hasActualDataToPopulate = (data: Step3Data): boolean => {
  return Boolean(
    (data.paymentObject?.value && data.paymentObject.value.trim() !== '') ||
      (data.paymentOption?.value && data.paymentOption.value.trim() !== '') ||
      (data.amount?.value && data.amount.value.trim() !== '') ||
      (data.dueDate?.value && data.dueDate.value.trim() !== '') ||
      (data.beneficiaries && data.beneficiaries.length > 0) ||
      (data.installments && data.installments.length > 0)
  );
};

/**
 * Populates the basic form fields with available data
 */
const populateBasicFields = (
  data: Step3Data,
  setValue: UseFormSetValue<Step3FormValues>
): boolean => {
  let hasPopulatedSomething = false;

  if (data.paymentObject?.value && data.paymentObject.value.trim() !== '') {
    setValue('paymentObject.value', data.paymentObject.value);
    hasPopulatedSomething = true;
  }

  if (data.paymentOption?.value && data.paymentOption.value.trim() !== '') {
    setValue('paymentOption.value', data.paymentOption.value);
    hasPopulatedSomething = true;
  }

  if (data.amount?.value && data.amount.value.trim() !== '') {
    setValue('amount.value', data.amount.value);
    hasPopulatedSomething = true;
  }

  return hasPopulatedSomething;
};

/**
 * Populates the due date field converting from string to Date if necessary
 */
const populateDueDateField = (
  data: Step3Data,
  setValue: UseFormSetValue<Step3FormValues>
): boolean => {
  if (data.dueDate?.value && data.dueDate.value.trim() !== '') {
    const dateValue =
      typeof data.dueDate.value === 'string'
        ? new Date(data.dueDate.value)
        : data.dueDate.value;
    setValue('dueDate.value', dateValue);
    return true;
  }
  return false;
};

/**
 * Populates the multi-beneficiary field
 */
const populateMultiBeneficiaryField = (
  data: Step3Data,
  setValue: UseFormSetValue<Step3FormValues>
): boolean => {
  if (data.isMultibeneficiary?.value != null) {
    setValue('isMultibeneficiary.value', data.isMultibeneficiary.value);
    return true;
  }
  return false;
};

/**
 * Populates the beneficiaries and installments fields
 */
const populateComplexFields = (
  data: Step3Data,
  setValue: UseFormSetValue<Step3FormValues>
): boolean => {
  let hasPopulatedSomething = false;

  if (data.beneficiaries && data.beneficiaries.length > 0) {
    setValue('beneficiaries', data.beneficiaries);
    hasPopulatedSomething = true;
  }

  if (data.installments && data.installments.length > 0) {
    setValue('installments', data.installments);
    hasPopulatedSomething = true;
  }

  return hasPopulatedSomething;
};

const Step3 = ({
  data,
  setData,
  onBack,
  step1Data,
  step2Data,
  isEditing = false
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state: { organizationId }
  } = useStore();

  // Extract debtPositionId for edit mode
  const debtPositionId = location.state?.debtPositionId;

  // Query to get debt position details for edit mode (to access paymentOptionId)
  const { data: debtPositionDetail } =
    isEditing && debtPositionId
      ? debtPositionsApi.getDebtPositionDetail(organizationId, debtPositionId)
      : { data: null };

  // Ref to avoid executing the setup logic more than once
  const hasSetupStep3Data = useRef(false);

  // Ref to track if the last action was publish (for correct title in completed page)
  const lastActionWasPublish = useRef(false);

  const isDraftInEdit =
    isEditing && debtPositionDetail?.status === DebtPositionStatus.DRAFT;

  const getNextButtonLabel = (): string => {
    if (isEditing) {
      return isDraftInEdit ? 'commons.create' : 'commons.save';
    }
    return 'commons.create';
  };

  const createDebtPositionMutation = debtPositionsApi.createDebtPosition();

  // Mutation for manage installments in edit mode
  const manageInstallmentsMutation =
    debtPositionsApi.manageDebtPositionInstallments();

  // Convert date string value to Date object for DatePicker
  const initialData: Step3FormValues = {
    ...data,
    dueDate: {
      ...data.dueDate,
      value: data.dueDate?.value ? new Date(data.dueDate.value) : null
    },
    paymentOption: {
      ...data.paymentOption,
      value: data.paymentOption.value as PaymentOption
    },
    beneficiaries: data.beneficiaries || [],
    installments: data.installments || [],
    flagMandatoryDueDate: data.flagMandatoryDueDate
  };

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitted },
    watch,
    setValue,
    trigger,
    getValues,
    reset
  } = useForm<Step3FormValues>({
    defaultValues: initialData,
    resolver: createStep3Resolver(t),
    mode: 'all',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    context: { flagMandatoryDueDate: data.flagMandatoryDueDate }
  });

  // Effect to populate form fields when data is available in edit mode
  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const hasActualData = hasActualDataToPopulate(data);

    if (hasActualData && !hasSetupStep3Data.current) {
      const basicFieldsPopulated = populateBasicFields(data, setValue);
      const dueDatePopulated = populateDueDateField(data, setValue);
      const multiBeneficiaryPopulated = populateMultiBeneficiaryField(
        data,
        setValue
      );
      const complexFieldsPopulated = populateComplexFields(data, setValue);

      const hasPopulatedSomething =
        basicFieldsPopulated ||
        dueDatePopulated ||
        multiBeneficiaryPopulated ||
        complexFieldsPopulated;

      if (hasPopulatedSomething) {
        hasSetupStep3Data.current = true;
      }
    }
  }, [
    isEditing,
    data.paymentObject?.value,
    data.paymentOption?.value,
    data.amount?.value,
    data.dueDate?.value,
    data.isMultibeneficiary?.value,
    data.beneficiaries,
    data.installments,
    setValue
  ]);

  const isMultibeneficiary = watch('isMultibeneficiary.value');
  const totalAmount = watch('amount.value');
  const beneficiaries = watch('beneficiaries') || [];
  const paymentOption = watch('paymentOption.value');
  const isInstallment = paymentOption === DebtPositionTypeEnum.INSTALLMENTS;

  // Effect to handle beneficiaries initialization
  useEffect(() => {
    const currentBeneficiaries = getValues('beneficiaries') || [];

    // Initialize beneficiaries only if switch is active and there are no beneficiaries yet
    // BUT not if we're in editing mode and have already set up the data from API
    if (
      isMultibeneficiary &&
      currentBeneficiaries.length === 0 &&
      !(isEditing && hasSetupStep3Data.current)
    ) {
      // Reset any persistent errors first
      setValue('beneficiaries', [], { shouldValidate: false });
      setValue(
        'beneficiaries',
        [
          {
            entityName: '',
            amount: '',
            taxCode: '',
            remittance: '',
            iban: '',
            postalIban: '',
            taxonomyCode: ''
          }
        ],
        { shouldDirty: true, shouldValidate: false }
      );
    } else if (!isMultibeneficiary) {
      setValue('beneficiaries', [], { shouldValidate: false });
    }
  }, [isMultibeneficiary, setValue, getValues, isEditing, hasSetupStep3Data]);

  // Handle total amount update when installments change
  const handleInstallmentsChange = (totalAmount: string) => {
    setValue('amount.value', totalAmount);
  };

  // Reference to BeneficiaryField component to access its methods
  const beneficiaryFieldRef = useRef<BeneficiaryFieldRef>({});

  // Handle multi-beneficiary toggle switch
  const handleMultibeneficiaryToggle = (value: boolean) => {
    // First reset the previous validation state
    if (
      value &&
      beneficiaryFieldRef.current &&
      beneficiaryFieldRef.current.resetAllBeneficiaries
    ) {
      beneficiaryFieldRef.current.resetAllBeneficiaries();
    }

    // Then set the new value
    setValue('isMultibeneficiary.value', value, { shouldValidate: false });

    // If disabling multi-beneficiary, reset beneficiaries
    if (
      !value &&
      beneficiaryFieldRef.current &&
      beneficiaryFieldRef.current.resetAllBeneficiaries
    ) {
      beneficiaryFieldRef.current.resetAllBeneficiaries();
    }
  };

  /**
   * Handles the amount field change
   * Normalizes the value and triggers validation for beneficiaries if needed
   */
  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    onChange: (...event: Array<unknown>) => void
  ) => {
    const filteredValue = e.target.value.replace(/[^0-9.,]/g, '');
    const normalizedValue = filteredValue.replace(',', '.');
    onChange(normalizedValue);

    if (isMultibeneficiary && beneficiaries.length > 0) {
      setTimeout(() => {
        triggerValidationForAllBeneficiaries(beneficiaries, trigger);
      }, 0);
    }
  };

  /**
   * Handles amount field blur event
   * Formats the value with two decimals when the field loses focus
   */
  const handleAmountBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: { onChange: (...event: Array<unknown>) => void; onBlur: () => void }
  ) => {
    const value = e.target.value.replace(',', '.');
    if (value && !isNaN(parseFloat(value))) {
      const formatted = parseFloat(value).toFixed(2);
      field.onChange(formatted);
    }
    field.onBlur();
  };

  /**
   * Handles payment option changes
   * Resets fields when changing from one payment mode to another
   */
  const handlePaymentOptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: { onChange: (...event: Array<unknown>) => void }
  ) => {
    const value = e.target.value;
    field.onChange(value);

    switch (value) {
      case DebtPositionTypeEnum.INSTALLMENTS:
        reset({
          ...initialData,
          paymentOption: {
            ...initialData.paymentOption,
            value: DebtPositionTypeEnum.INSTALLMENTS as PaymentOption
          },
          isMultibeneficiary: {
            ...initialData.isMultibeneficiary,
            value: false
          },
          beneficiaries: [],
          installments: []
        });
        break;
      case PaymentOptionTypeEnum.SINGLE_INSTALLMENT:
        if (paymentOption === DebtPositionTypeEnum.INSTALLMENTS) {
          reset({
            ...initialData,
            paymentOption: {
              ...initialData.paymentOption,
              value: DebtPositionTypeEnum.SINGLE as PaymentOption
            },
            isMultibeneficiary: {
              ...initialData.isMultibeneficiary,
              value: false
            },
            beneficiaries: [],
            installments: []
          });
        }
        break;
    }

    setTimeout(() => {
      if (
        beneficiaryFieldRef.current &&
        beneficiaryFieldRef.current.resetAllBeneficiaries
      ) {
        beneficiaryFieldRef.current.resetAllBeneficiaries();
      }
    }, 0);
  };

  /**
   * Validates installments and their beneficiaries
   * @returns An object with the validation result and synchronized installments
   */
  const validateInstallmentsData = async (): Promise<{
    isValid: boolean;
    syncedInstallments?: Array<Installment>;
  }> => {
    const installments = getValues('installments') || [];

    const cleanedInstallments = installments.map((installment) => {
      if (!installment.isMultibeneficiary) {
        return {
          ...installment,
          beneficiaries: []
        };
      }
      return installment;
    });

    const { installments: syncedInstallments, modified } =
      syncInstallmentBeneficiaries(cleanedInstallments as Array<Installment>);

    if (modified) {
      setValue('installments', syncedInstallments);
    }

    const validationResults = validateInstallments(syncedInstallments, trigger);

    const hasValidationFailure = Object.values(validationResults).some(
      (value) => value
    );

    if (hasValidationFailure) {
      handleInstallmentValidationFailure(
        syncedInstallments,
        validationResults,
        trigger
      );
      return { isValid: false };
    }

    return { isValid: true, syncedInstallments };
  };

  const getSaveDraftHandler = (): (() => void) | undefined => {
    if (isDraftInEdit) {
      // DRAFT in edit: save without publishing
      return handleSubmit((values) => onSubmit(values, false, false));
    }
    if (!isEditing) {
      // Creation mode: save as draft
      return handleSubmit((values) => onSubmit(values, true));
    }
    // UNPAID/EXPIRED in edit: no save draft option
    return undefined;
  };

  const onSubmit = async (
    values: Step3FormValues,
    isDraft = false,
    shouldPublish = false
  ) => {
    // Check due date field if mandatory
    if (!isInstallment && values.flagMandatoryDueDate) {
      if (!values.dueDate.value) {
        setValue('dueDate.value', null, { shouldValidate: true });
        await trigger('dueDate.value');
        return;
      }
    }

    // Validate all fields before proceeding
    const isValid = await trigger();

    if (!isValid) {
      return;
    }

    // For single payment, validate beneficiaries
    if (!isInstallment) {
      const beneficiariesValid = validateMultiBeneficiary(
        () => getValues('beneficiaries') || [],
        isMultibeneficiary,
        totalAmount,
        (name) => trigger(`beneficiaries.${name}` as Path<Step3FormValues>)
      );

      if (!beneficiariesValid) {
        return;
      }
    }

    // Validate beneficiaries for each installment if payment is installment-based
    if (isInstallment) {
      const { isValid, syncedInstallments } = await validateInstallmentsData();

      if (!isValid || !syncedInstallments) {
        return;
      }

      if (
        JSON.stringify(getValues('installments')) !==
        JSON.stringify(syncedInstallments)
      ) {
        setValue('installments', syncedInstallments);
      }
    }

    // Transform form values using conversion function
    const formattedValues: Step3Data = convertFormValuesToStep3Data({
      ...values,
      flagMandatoryDueDate: values.flagMandatoryDueDate,
      step1Data,
      step2Data
    });

    // Save data
    setData(formattedValues);

    // In edit mode, call manage installments API
    if (isEditing && debtPositionId && debtPositionDetail) {
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
        utils.notify.emit(
          t('debtPositionCreateWizard.errorMissingId'),
          'error'
        );
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
      return;
    }

    const postBody: DebtPositionDTO = {
      description: formattedValues.step1Data?.description.value || '',
      status: isDraft ? DebtPositionStatus.DRAFT : DebtPositionStatus.UNPAID,
      organizationId: organizationId,
      debtPositionTypeOrgId: Number(
        formattedValues.step1Data?.debtPositionType.value || 0
      ),
      flagIuvVolatile: DEFAULT_VALUES.FLAG_IUV_VOLATILE,
      debtPositionOrigin: DebtPositionOrigin.ORDINARY,
      multiDebtor: DEFAULT_VALUES.MULTI_DEBTOR,
      flagPuPagoPaPayment: DEFAULT_VALUES.FLAG_PAGO_PA_PU_PAYMENT,
      paymentOptions: [
        {
          totalAmountCents: Math.round(
            parseFloat(formattedValues.amount.value || '0') * 100
          ),
          description: isInstallment
            ? t('debtPositionCreateWizard.step3.paymentOption.installments')
            : t('debtPositionCreateWizard.step3.paymentOption.single'),
          paymentOptionType: isInstallment
            ? PaymentOptionTypeEnum.INSTALLMENTS
            : PaymentOptionTypeEnum.SINGLE_INSTALLMENT,
          paymentOptionIndex: DEFAULT_VALUES.PAYMENT_OPTION_INDEX,
          installments: isInstallment
            ? formattedValues.installments?.map((installment) =>
                createInstallmentObject(installment, step2Data, formattedValues)
              ) || []
            : [createSingleInstallmentObject(formattedValues, step2Data)]
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

  return (
    <form
      id="step3-configuration-form"
      data-testid="step3-form"
      onSubmit={handleSubmit((values) => onSubmit(values, false))}
    >
      <WizardStepWrapper
        title={t('debtPositionCreateWizard.configurationAlert.title')}
        subtitle={t('debtPositionCreateWizard.configurationAlert.subtitle')}
      >
        <SectionBox
          title={t('debtPositionCreateWizard.step3.title')}
          adornment={<ArticleIcon />}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="paymentObject.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="payment-object-input"
                    data-testid="payment-object-field"
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.paymentObject.label'
                    )}
                    required={!isInstallment}
                    disabled={data.paymentObject?.readonly || isInstallment}
                    error={
                      isSubmitted &&
                      !!errors.paymentObject?.value &&
                      !isInstallment
                    }
                    helperText={
                      isSubmitted &&
                      errors.paymentObject?.value?.message &&
                      !isInstallment
                        ? errors.paymentObject?.value?.message
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="paymentOption.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="payment-option-select"
                    data-testid="payment-option-field"
                    select
                    fullWidth
                    label={t(
                      'debtPositionCreateWizard.step3.paymentOption.label'
                    )}
                    required
                    disabled={data.paymentOption?.readonly}
                    error={!!errors.paymentOption?.value}
                    helperText={errors.paymentOption?.value?.message || ''}
                    onChange={(e) => handlePaymentOptionChange(e, field)}
                  >
                    <MenuItem
                      value="SINGLE"
                      data-testid="payment-option-single"
                    >
                      {t('debtPositionCreateWizard.step3.paymentOption.single')}
                    </MenuItem>
                    <MenuItem
                      value="INSTALLMENTS"
                      data-testid="payment-option-installments"
                    >
                      {t(
                        'debtPositionCreateWizard.step3.paymentOption.installments'
                      )}
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="amount.value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="amount-input"
                    data-testid="amount-field"
                    fullWidth
                    label={t('debtPositionCreateWizard.step3.amount.label')}
                    required
                    disabled={data.amount?.readonly || isInstallment}
                    value={
                      field.value
                        ? field.value.toString().replace('.', ',')
                        : ''
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">€</InputAdornment>
                      ),
                      inputProps: {
                        style: { textAlign: 'left' },
                        onWheel: (e) =>
                          e.target instanceof HTMLElement && e.target.blur() // Remove focus when mouse wheel is used
                      }
                    }}
                    error={
                      isSubmitted && !!errors.amount?.value && !isInstallment
                    }
                    helperText={
                      isInstallment
                        ? t(
                            'debtPositionCreateWizard.step3.amount.installmentHelperText'
                          )
                        : isSubmitted && errors.amount?.value?.message
                    }
                    onChange={(e) => handleAmountChange(e, field.onChange)}
                    onBlur={(e) => handleAmountBlur(e, field)}
                  />
                )}
              />
            </Grid>

            {/* Show due date field only if NOT in installment mode */}
            {!isInstallment && (
              <Grid item xs={12}>
                <Controller
                  name="dueDate.value"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <DatePicker
                      {...field}
                      data-testid="due-date-picker"
                      value={value}
                      label={t('debtPositionCreateWizard.step3.dueDate.label')}
                      disabled={data.dueDate?.readonly}
                      minDate={new Date()}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: data.flagMandatoryDueDate,
                          error: data.flagMandatoryDueDate
                            ? isSubmitted && (!value || !!errors.dueDate?.value)
                            : isSubmitted && !!errors.dueDate?.value,
                          helperText:
                            isSubmitted && data.flagMandatoryDueDate && !value
                              ? t(
                                  'debtPositionCreateWizard.step3.dueDate.required'
                                )
                              : (isSubmitted &&
                                  errors.dueDate?.value?.message) ||
                                ''
                        },
                        actionBar: {
                          actions: ['clear']
                        }
                      }}
                      onChange={(date) => {
                        onChange(date);
                        // Force validation when date changes if it's mandatory
                        if (data.flagMandatoryDueDate) {
                          setTimeout(() => {
                            trigger('dueDate.value');
                          }, 0);
                        }
                      }}
                      onClose={() => {
                        // Force validation when picker closes
                        if (data.flagMandatoryDueDate) {
                          trigger('dueDate.value');
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Show multi-beneficiary switch only if NOT in installment mode */}
            {!isInstallment && (
              <Grid item xs={12}>
                <Controller
                  name="isMultibeneficiary.value"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      data-testid="multi-beneficiary-switch"
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          disabled={data.isMultibeneficiary?.readonly}
                          onChange={(e) => {
                            const value = e.target.checked;
                            handleMultibeneficiaryToggle(value);
                          }}
                        />
                      }
                      label={t(
                        'debtPositionCreateWizard.step3.isMultibeneficiary.label'
                      )}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Beneficiary component - visible only when multi-beneficiary is true AND not in installment mode */}
            {isMultibeneficiary && !isInstallment && (
              <Grid item xs={12} mt={2} data-testid="beneficiary-section">
                <BeneficiaryField<Step3FormValues>
                  ref={beneficiaryFieldRef}
                  control={control}
                  errors={errors}
                  isSubmitted={isSubmitted}
                  totalAmount={totalAmount}
                  fieldNamePrefix="beneficiaries"
                  disabled={false}
                  setValue={setValue}
                  getValues={getValues}
                  trigger={trigger}
                  onToggleMultibeneficiary={handleMultibeneficiaryToggle}
                  isEditing={isEditing}
                />
              </Grid>
            )}
          </Grid>
        </SectionBox>
      </WizardStepWrapper>
      {/* Installments component - visible only when installment option is selected */}
      {isInstallment && (
        <div data-testid="installments-section">
          <InstallmentField<Step3FormValues>
            control={control}
            errors={errors}
            isSubmitted={isSubmitted}
            fieldNamePrefix="installments"
            disabled={false}
            flagMandatoryDueDate={data.flagMandatoryDueDate}
            setValue={setValue}
            getValues={getValues}
            trigger={trigger}
            onInstallmentsChange={handleInstallmentsChange}
            isEditing={isEditing}
          />
        </div>
      )}
      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit((values) =>
          onSubmit(values, false, isDraftInEdit)
        )}
        onSaveDraft={getSaveDraftHandler()}
        disableNext={false}
        nextLabel={getNextButtonLabel()}
        showSaveDraft={isDraftInEdit || !isEditing}
        saveDraftLabel={isDraftInEdit ? 'commons.save' : 'commons.saveDraft'}
        showSaveDraftIcon={!isDraftInEdit}
      />
    </form>
  );
};

export default Step3;
