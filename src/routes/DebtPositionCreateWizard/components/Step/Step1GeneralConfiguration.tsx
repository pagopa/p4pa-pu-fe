import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from '../../../../store/GlobalStore';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { getDebtPositionTypeOrgs } from '../../../../api/debtPositionsTypeOrg';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import BookIcon from '@mui/icons-material/MenuBook';
import {
  DebtPositionType,
  Step1Data
} from '../../../../models/DebtPositionType';
import {
  createStep1GeneralConfigurationSchema,
  Step1GeneralConfigurationFormValues
} from '../../../../models/Step1GeneralConfigurationSchema';
import { useEffect, useRef, useMemo } from 'react';

// Types for react-hook-form
type FormValues = Step1GeneralConfigurationFormValues;

type Props = {
  data: Step1Data;
  setData: (data: Step1Data) => void;
  onNext: () => void;
  onBack?: () => void;
  isEditing?: boolean;
  debtPositionTypeOrgCode?: string;
};

const Step1GeneralConfiguration = ({
  data,
  setData,
  onNext,
  onBack,
  isEditing = false,
  debtPositionTypeOrgCode
}: Props) => {
  const {
    state: { organizationId }
  } = useStore();
  const { t } = useTranslation();

  // Ref to avoid executing the setup logic more than once
  const hasSetupDebtPositionType = useRef(false);

  const {
    data: debtPositionTypeOrgsData,
    isLoading: isLoadingDebtPositionTypes
  } = getDebtPositionTypeOrgs({
    organizationId
  });

  // Create the array of options for the select from the complete data
  const debtPositionsTypes: Array<DebtPositionType> = useMemo(() => {
    if (!debtPositionTypeOrgsData) return [];

    return debtPositionTypeOrgsData
      .filter(
        (type) => type?.description && type?.debtPositionTypeOrgId !== undefined
      )
      .sort((a, b) => a.description.localeCompare(b.description))
      .map((type) => ({
        label: type.description,
        value: type.debtPositionTypeOrgId as number,
        flagMandatoryDueDate: type.flagMandatoryDueDate || false
      }));
  }, [debtPositionTypeOrgsData]);

  // Create the Zod schema with translation function
  const schema = createStep1GeneralConfigurationSchema(t);

  // Determinare se i dati sono pronti per il rendering
  const isDataReady = () => {
    if (!isEditing) {
      // In creation mode, the data is always ready if not loading
      return !isLoadingDebtPositionTypes;
    }

    // In edit mode, wait for all necessary data to be available
    return (
      !isLoadingDebtPositionTypes &&
      debtPositionTypeOrgCode &&
      debtPositionTypeOrgsData &&
      debtPositionsTypes.length > 0 &&
      data?.description?.value !== undefined
    );
  };

  const getInitialValues = () => {
    if (!isEditing || !isDataReady()) {
      return {
        debtPositionType: data?.debtPositionType?.value || '',
        description: data?.description?.value || ''
      };
    }

    // In edit mode, find the debt position type corresponding to the code
    const matchingTypeOrg = debtPositionTypeOrgsData?.find(
      (typeOrg) => typeOrg.code === debtPositionTypeOrgCode
    );

    if (matchingTypeOrg) {
      const matchingSelectOption = debtPositionsTypes.find(
        (type) => type.value === matchingTypeOrg.debtPositionTypeOrgId
      );

      if (matchingSelectOption) {
        return {
          debtPositionType: matchingSelectOption.value.toString(),
          description: data?.description?.value || ''
        };
      }
    }

    return {
      debtPositionType: '',
      description: data?.description?.value || ''
    };
  };

  // Form initialization with react-hook-form
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm<FormValues>({
    defaultValues: getInitialValues(),
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });

  // Effect to repopulate the form fields when the data becomes available
  useEffect(() => {
    if (
      isEditing &&
      isDataReady() &&
      debtPositionTypeOrgCode &&
      debtPositionTypeOrgsData
    ) {
      const matchingTypeOrg = debtPositionTypeOrgsData.find(
        (typeOrg) => typeOrg.code === debtPositionTypeOrgCode
      );

      if (matchingTypeOrg) {
        const matchingSelectOption = debtPositionsTypes.find(
          (type) => type.value === matchingTypeOrg.debtPositionTypeOrgId
        );

        if (matchingSelectOption) {
          // Update form values
          setValue('debtPositionType', matchingSelectOption.value.toString());

          // Update parent component data (only once)
          if (!hasSetupDebtPositionType.current) {
            const updatedData = {
              ...data,
              debtPositionType: {
                ...data.debtPositionType,
                value: matchingSelectOption.value.toString(),
                flagMandatoryDueDate:
                  matchingSelectOption.flagMandatoryDueDate || false
              }
            };
            setData(updatedData);
            hasSetupDebtPositionType.current = true;
          }
        }
      }

      // Update description if available
      if (data?.description?.value) {
        setValue('description', data.description.value);
      }
    }
  }, [
    isEditing,
    isDataReady(),
    debtPositionTypeOrgCode,
    debtPositionTypeOrgsData,
    debtPositionsTypes,
    data?.description?.value,
    setValue,
    setData,
    data
  ]);

  // Function called on valid form submission
  const onSubmit = (values: FormValues) => {
    const selectedType = debtPositionsTypes.find(
      (type: DebtPositionType) =>
        type.value.toString() === values.debtPositionType
    );

    const updatedData = {
      debtPositionType: {
        value: values.debtPositionType,
        flagMandatoryDueDate: selectedType?.flagMandatoryDueDate ?? false,
        readonly: data.debtPositionType.readonly
      },
      description: {
        value: values.description,
        readonly: data.description.readonly
      }
    };

    setData(updatedData);
    onNext();
  };

  // Non renderizzare il form fino a quando i dati non sono pronti
  if (!isDataReady()) {
    // Il loading sarà gestito automaticamente dal sistema centralizzato di react-query
    return null;
  }

  return (
    <form>
      <WizardStepWrapper
        title={t('debtPositionCreateWizard.generalConfiguration.title')}
        subtitle={t('debtPositionCreateWizard.generalConfiguration.subtitle')}
      >
        <SectionBox
          title={t('debtPositionCreateWizard.step1.title')}
          adornment={<BookIcon />}
        >
          {/* Debt position type selection */}
          <Controller
            name="debtPositionType"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t(
                  'debtPositionCreateWizard.step1.debtPositionType.label'
                )}
                select
                required
                fullWidth
                margin="normal"
                disabled={data.debtPositionType.readonly}
                error={!!errors.debtPositionType}
                helperText={errors.debtPositionType?.message}
              >
                {debtPositionsTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          {/* Debt position description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('debtPositionCreateWizard.step1.description.label')}
                fullWidth
                margin="normal"
                required
                disabled={data.description.readonly}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};

export default Step1GeneralConfiguration;
