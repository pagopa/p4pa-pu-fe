import { useForm } from 'react-hook-form';
import { useStore } from '../../../store/GlobalStore';
import { useTranslation } from 'react-i18next';
import { Box, MenuItem, TextField } from '@mui/material';
import { useDebtPositionsTypeOrg } from '../../../hooks/useDebtPositionsTypeOrg';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';

// Tipizzazione per lo stato dello step 1
type Step1Data = {
  debtPositionType: {
    value: string;
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
    register, // per collegare i campi
    handleSubmit, // per gestire l'invio del form
    watch, // per osservare i valori in tempo reale
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
        readonly: data.debtPositionType.readonly
      },
      description: {
        value: values.description,
        readonly: data.description.readonly
      }
    });
    onNext();
  };

  // Recupera in tempo reale il valore della select per abilitare/disabilitare il bottone
  const debtPositionTypeSelected = watch('debtPositionType') || '';

  return (
    <Box>
      <SectionBox title={t('debtPositionCreateWizard.step1.title')}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Select - Tipo di dovuto */}
          <TextField
            label={t('debtPositionCreateWizard.step1.debtPositionType.label')}
            select
            required
            fullWidth
            margin="normal"
            disabled={data.debtPositionType.readonly}
            error={!!errors.debtPositionType}
            helperText={errors.debtPositionType?.message}
            {...register('debtPositionType', {
              // required: t('commons.required')
            })}
            value={debtPositionTypeSelected} // Assicura un valore predefinito, evita warning MUI
          >
            {debtPositionsTypes.map((option) => (
              <MenuItem key={option.value} value={option.value.toString()}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {/* Input - Descrizione posizione debitoria */}
          <TextField
            label={t('debtPositionCreateWizard.step1.description.label')}
            fullWidth
            margin="normal"
            disabled={data.description.readonly}
            error={!!errors.description}
            helperText={errors.description?.message}
            {...register('description', {
              validate: (value) => {
                if (value.trim() === '') return true; // campo vuoto = ok
                const wordCount = value.trim().split(/\s+/).length;
                return (
                  wordCount >= 5 || t('debtPositionCreateWizard.step1.minWords')
                );
              }
            })}
          />
          <WizardStepButtons
            onBack={onBack}
            disableBack={true}
            disableNext={
              data.debtPositionType.readonly
                ? false
                : debtPositionTypeSelected === ''
            }
            onNext={handleSubmit(onSubmit)}
          />
        </form>
      </SectionBox>
    </Box>
  );
};

export default Step1GeneralConfiguration;
