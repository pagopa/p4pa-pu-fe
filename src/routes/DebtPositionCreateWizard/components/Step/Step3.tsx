import {
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../../components/Wizard/SectionBox';
import ArticleIcon from '@mui/icons-material/Article';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useEffect, useRef } from 'react';
import BeneficiaryField from '../Beneficiary/BeneficiaryField';
import InstallmentField from '../Installment/InstallmentField';
import type { PaymentOption } from '../../../../models/paymentTypes';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { BeneficiaryFieldRef } from '../Beneficiary/BeneficiaryField';
import { useStore } from '../../../../store/GlobalStore';
import {
  Step2Data,
  Step3Data,
  Step1Data,
  DebtPositionTypeEnum
} from '../../../../models/DebtPositionType';
import debtPositionsApi from '../../../../api/debtPositions';
import { DebtPositionStatus } from '../../../../../generated/data-contracts';
import {
  createStep3Resolver,
  Step3FormValues
} from '../../../../models/Step3Schema';
import { useStep3ApiOperations } from '../../../../hooks/useStep3ApiOperations';
import { useStep3FormHandlers } from '../../../../hooks/useStep3FormHandlers';
import { useStep3Validation } from '../../../../hooks/useStep3Validation';
import {
  hasActualDataToPopulate,
  populateAllFormFields,
  prepareFormData
} from '../../../../utils/step3FormDataUtils';

type Props = {
  data: Step3Data;
  setData: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
  step1Data: Step1Data;
  step2Data: Step2Data;
  isEditing?: boolean;
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
  const location = useLocation();
  const {
    state: { organizationId }
  } = useStore();

  // Custom hook for managing API operations
  const { handleEditModeFlow, handleCreateModeFlow } = useStep3ApiOperations();

  // Extract debtPositionId for edit mode
  const debtPositionId = location.state?.debtPositionId;

  // Query to get debt position details for edit mode (to access paymentOptionId)
  const { data: debtPositionDetail } =
    isEditing && debtPositionId
      ? debtPositionsApi.getDebtPositionDetail(organizationId, debtPositionId)
      : { data: null };

  // Ref to avoid executing the setup logic more than once
  const hasSetupStep3Data = useRef(false);

  const isDraftInEdit =
    isEditing && debtPositionDetail?.status === DebtPositionStatus.DRAFT;

  const getNextButtonLabel = (): string => {
    if (isEditing) {
      return isDraftInEdit ? 'commons.edit' : 'commons.save';
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
    formState: { errors },
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

  // Centralized validation hook - manages hasClickedFinalCTA, submissionCount, and validation logic
  const {
    hasClickedFinalCTA,
    submissionCount,
    markFinalCTAClicked,
    resetValidationState,
    validateStep3Form,
    shouldShowErrors
  } = useStep3Validation({
    setValue,
    trigger,
    getValues,
    flagMandatoryDueDate: data.flagMandatoryDueDate
  });

  // Effect to populate form fields when data is available in edit mode
  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const hasActualData = hasActualDataToPopulate(data);

    if (hasActualData && !hasSetupStep3Data.current) {
      const { hasPopulatedSomething } = populateAllFormFields({
        data,
        setValue
      });

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

  // Reference to BeneficiaryField component to access its methods
  const beneficiaryFieldRef = useRef<BeneficiaryFieldRef>({});

  // Custom hook for managing the form event handlers
  const {
    handleAmountChange,
    handleAmountBlur,
    handlePaymentOptionChange,
    handleMultibeneficiaryToggle
  } = useStep3FormHandlers({
    setValue,
    trigger,
    reset,
    getValues,
    initialData,
    isMultibeneficiary,
    beneficiaries,
    paymentOption,
    beneficiaryFieldRef,
    resetValidationState
  });

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

  const handleCreateClick = () => {
    markFinalCTAClicked();

    // Force a re-render and then submit
    setTimeout(() => {
      handleSubmit((values) => onSubmit(values, false, isDraftInEdit))();
    }, 0);
  };

  const handleSaveDraftClick = () => {
    markFinalCTAClicked();

    // Force a re-render and then submit
    setTimeout(() => {
      if (isDraftInEdit) {
        handleSubmit((values) => onSubmit(values, false, false))();
      } else {
        handleSubmit((values) => onSubmit(values, true))();
      }
    }, 0);
  };

  const getSaveDraftHandler = (): (() => void) | undefined => {
    if (isDraftInEdit) {
      // DRAFT in edit: save without publishing
      return handleSaveDraftClick;
    }
    if (!isEditing) {
      // Creation mode: save as draft
      return handleSaveDraftClick;
    }
    // UNPAID/EXPIRED in edit: no save draft option
    return undefined;
  };

  const onSubmit = async (
    values: Step3FormValues,
    isDraft = false,
    shouldPublish = false
  ) => {
    // Use centralized validation
    const { isValid, syncedInstallments } = await validateStep3Form({
      isInstallment,
      isMultibeneficiary,
      totalAmount
    });

    if (!isValid) {
      return;
    }

    // Transform form values and save data
    const formattedData = prepareFormData({
      values,
      syncedInstallments,
      step1Data,
      step2Data,
      setData
    });

    // In edit mode, call manage installments API
    if (isEditing && debtPositionId && debtPositionDetail) {
      await handleEditModeFlow({
        values,
        step1Data,
        step2Data,
        debtPositionId,
        debtPositionDetail,
        shouldPublish,
        isDraftInEdit,
        organizationId,
        manageInstallmentsMutation
      });
      return;
    }

    // Create new debt position
    await handleCreateModeFlow({
      formattedData,
      step1Data,
      step2Data,
      isInstallment,
      isDraft,
      organizationId,
      createDebtPositionMutation
    });
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
        showRequiredFieldsMessage={true}
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
                      hasClickedFinalCTA &&
                      !!errors.paymentObject?.value &&
                      !isInstallment
                    }
                    helperText={
                      hasClickedFinalCTA &&
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
                    error={hasClickedFinalCTA && !!errors.paymentOption?.value}
                    helperText={
                      hasClickedFinalCTA && errors.paymentOption?.value?.message
                        ? errors.paymentOption?.value?.message
                        : ''
                    }
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
                      hasClickedFinalCTA &&
                      !!errors.amount?.value &&
                      !isInstallment
                    }
                    helperText={
                      isInstallment
                        ? t(
                            'debtPositionCreateWizard.step3.amount.installmentHelperText'
                          )
                        : hasClickedFinalCTA && errors.amount?.value?.message
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
                            ? hasClickedFinalCTA &&
                              (!value || !!errors.dueDate?.value)
                            : hasClickedFinalCTA && !!errors.dueDate?.value,
                          helperText:
                            hasClickedFinalCTA &&
                            data.flagMandatoryDueDate &&
                            !value
                              ? t(
                                  'debtPositionCreateWizard.step3.dueDate.required'
                                )
                              : (hasClickedFinalCTA &&
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
                  isSubmitted={false}
                  totalAmount={totalAmount}
                  fieldNamePrefix="beneficiaries"
                  disabled={false}
                  setValue={setValue}
                  getValues={getValues}
                  trigger={trigger}
                  onToggleMultibeneficiary={handleMultibeneficiaryToggle}
                  isEditing={isEditing}
                  shouldShowErrors={shouldShowErrors}
                  submissionCount={submissionCount}
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
            isSubmitted={hasClickedFinalCTA}
            fieldNamePrefix="installments"
            disabled={false}
            flagMandatoryDueDate={data.flagMandatoryDueDate}
            setValue={setValue}
            getValues={getValues}
            trigger={trigger}
            onInstallmentsChange={handleInstallmentsChange}
            isEditing={isEditing}
            shouldShowErrors={shouldShowErrors}
            submissionCount={submissionCount}
          />
        </div>
      )}
      <WizardStepButtons
        onBack={onBack}
        onNext={handleCreateClick}
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
