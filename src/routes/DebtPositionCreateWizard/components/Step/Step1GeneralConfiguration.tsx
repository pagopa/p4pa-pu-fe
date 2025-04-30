import { Controller, useForm } from 'react-hook-form';
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

// Types for react-hook-form
type FormValues = {
  debtPositionType: string;
  description: string;
};

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

  // Form initialization with react-hook-form
  const {
    handleSubmit, // to handle form submission
    control, // to control values
    formState: { errors } // contains validation errors
  } = useForm<FormValues>({
    defaultValues: {
      debtPositionType: data?.debtPositionType?.value || '',
      description: data?.description?.value || ''
    }
  });
  // Function called on valid form submission
  const onSubmit = (values: FormValues) => {
    // Trova il tipo di dovuto selezionato
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
            rules={{
              required: t(
                'debtPositionCreateWizard.step1.debtPositionType.required'
              )
            }}
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
            rules={{
              required: t(
                'debtPositionCreateWizard.step1.description.required'
              ),
              validate: (value) => {
                const trimmed = value.trim();
                const wordCount = trimmed.split(/\s+/).length;
                return (
                  wordCount >= 3 || t('debtPositionCreateWizard.step1.minWords')
                );
              }
            }}
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
