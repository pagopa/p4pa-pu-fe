import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from '../../../../store/GlobalStore';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { useDebtPositionsTypeOrg } from '../../../../hooks/useDebtPositionsTypeOrg';
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

// Types for react-hook-form
type FormValues = Step1GeneralConfigurationFormValues;

type Props = {
  data: Step1Data;
  setData: (data: Step1Data) => void;
  onNext: () => void;
  onBack?: () => void;
};

const Step1GeneralConfiguration = ({
  data,
  setData,
  onNext,
  onBack
}: Props) => {
  const {
    state: { organizationId }
  } = useStore();
  const { t } = useTranslation();
  // Custom hook to retrieve available debt position types
  const { optionsMap: debtPositionsTypes } = useDebtPositionsTypeOrg({
    organizationId,
    includeAllOption: false
  }) as { optionsMap: Array<DebtPositionType> };

  // Create the Zod schema with translation function
  const schema = createStep1GeneralConfigurationSchema(t);

  // Form initialization with react-hook-form
  const {
    handleSubmit, // to handle form submission
    control, // to control values
    formState: { errors } // contains validation errors
  } = useForm<FormValues>({
    defaultValues: {
      debtPositionType: data?.debtPositionType?.value || '',
      description: data?.description?.value || ''
    },
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });
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
          {/* Select - Debt position type */}
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
          {/* Input - Debt position description */}
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
