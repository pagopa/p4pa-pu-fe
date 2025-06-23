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

  const hasSetupDebtPositionType = useRef(false);

  const {
    data: debtPositionTypeOrgsData,
    isLoading: isLoadingDebtPositionTypes
  } = getDebtPositionTypeOrgs({
    organizationId
  });

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

  const schema = createStep1GeneralConfigurationSchema(t);

  const isDataReady = (): boolean => {
    if (!isEditing) {
      return !isLoadingDebtPositionTypes;
    }

    const hasRequiredData =
      !isLoadingDebtPositionTypes &&
      Boolean(debtPositionTypeOrgCode) &&
      Boolean(debtPositionTypeOrgsData) &&
      debtPositionsTypes.length > 0 &&
      Boolean(data?.description?.value);

    return hasRequiredData;
  };

  const getInitialValues = () => {
    if (!isEditing || !isDataReady()) {
      return {
        debtPositionType: data?.debtPositionType?.value || '',
        description: data?.description?.value || ''
      };
    }

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
          setValue('debtPositionType', matchingSelectOption.value.toString());

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

  if (!isDataReady()) {
    return null;
  }

  return (
    <form data-testid="step1-general-configuration">
      <WizardStepWrapper
        title={t('debtPositionCreateWizard.generalConfiguration.title')}
        subtitle={t('debtPositionCreateWizard.generalConfiguration.subtitle')}
      >
        <SectionBox
          title={t('debtPositionCreateWizard.step1.title')}
          adornment={<BookIcon />}
        >
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
