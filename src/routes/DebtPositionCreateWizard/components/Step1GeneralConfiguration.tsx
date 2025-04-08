import { Controller, useForm } from 'react-hook-form';
import { useStore } from '../../../store/GlobalStore';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { useDebtPositionsTypeOrg } from '../../../hooks/useDebtPositionsTypeOrg';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import BookIcon from '@mui/icons-material/MenuBook';

// Tipizzazione per lo stato dello step 1
export type Step1Data = {
  debtPositionType: {
    value: string;
    flagMandatoryDueDate: boolean;
    readonly: boolean;
  };
  description: {
    value: string;
    readonly: boolean;
  };
};
// Tipi per react-hook-form
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
  // Hook custom per recuperare i tipi di dovuto disponibili
  const { optionsMap: debtPositionsTypes } = useDebtPositionsTypeOrg({
    organizationId
  });

  // Inizializzazione del form con react-hook-form
  const {
    handleSubmit, // per gestire l'invio del form
    control, // per controllare i valori
    formState: { errors } // contiene gli errori di validazione
  } = useForm<FormValues>({
    defaultValues: {
      debtPositionType: data?.debtPositionType?.value || '',
      description: data?.description?.value || ''
    }
  });
  // Funzione chiamata al submit valido del form
  const onSubmit = (values: FormValues) => {
    setData({
      debtPositionType: {
        value: values.debtPositionType,
        flagMandatoryDueDate: data.debtPositionType.flagMandatoryDueDate,
        readonly: data.debtPositionType.readonly
      },
      description: {
        value: values.description,
        readonly: data.description.readonly
      }
    });
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
          {/* Select - Tipo di dovuto */}
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
          {/* Input - Descrizione posizione debitoria */}
          <Controller
            name="description"
            control={control}
            rules={{
              required: t(
                'debtPositionCreateWizard.step1.description.required'
              ),
              validate: (value) => {
                const trimmed = value.trim();
                // if (trimmed === '') return true;
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
      <WizardStepButtons
        onBack={onBack}
        disableBack={true}
        disableNext={false}
        onNext={handleSubmit(onSubmit)}
      />
    </form>
  );
};

export default Step1GeneralConfiguration;
