import {
  Box,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import SectionBox from '../../../components/Wizard/SectionBox';
import PaperContent from '../../../components/Wizard/PaperContent';
import ArticleIcon from '@mui/icons-material/Article';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/formatters';

type Step3Data = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: string; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: string | null; readonly: boolean };
  isMultibeneficiary: { value: boolean; readonly: boolean };
};

type Props = {
  data: Step3Data;
  setData: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
};

type FormValues = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: string; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: Date | null; readonly: boolean };
  isMultibeneficiary: { value: boolean; readonly: boolean };
};

const Step3 = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();

  // Converti il valore stringa della data in oggetto Date per il DatePicker
  const initialData: FormValues = {
    ...data,
    dueDate: {
      ...data.dueDate,
      value: data.dueDate?.value ? new Date(data.dueDate.value) : null
    }
  };

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitted },
    trigger,
    clearErrors,
    setValue
  } = useForm<FormValues>({
    defaultValues: initialData,
    mode: 'onChange'
  });

  const onSubmit = async (values: FormValues) => {
    // Converti la data in stringa prima di salvare
    const formattedValues: Step3Data = {
      ...values,
      dueDate: {
        ...values.dueDate,
        value:
          values.dueDate.value instanceof Date
            ? formatDate(values.dueDate.value.toISOString())
            : values.dueDate.value
      }
    };
    setData(formattedValues);
    onNext();
  };

  // Funzione per gestire il cambiamento di un qualsiasi campo del form
  const handleFieldChange = async (
    fieldName: keyof FormValues,
    value: string | boolean | Date | null
  ) => {
    // Se il campo è dueDate e il valore è una stringa, convertilo in Date
    if (fieldName === 'dueDate' && typeof value === 'string') {
      value = new Date(value);
    }

    // Imposta il nuovo valore nel form
    if (fieldName === 'dueDate') {
      setValue(`${fieldName}.value`, value as Date | null);
    } else if (fieldName === 'isMultibeneficiary') {
      setValue(`${fieldName}.value`, value as boolean);
    } else {
      setValue(`${fieldName}.value`, value as string);
    }

    // Se il form è già stato inviato, verifica il campo e pulisce eventuali errori
    if (isSubmitted) {
      const isFieldValid = await trigger(`${fieldName}.value`);
      if (isFieldValid) {
        clearErrors(`${fieldName}.value`);
      }
    }
  };

  return (
    <Box>
      <SectionBox hideHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <PaperContent
            title={t('debtPositionCreateWizard.step3.title')}
            icon={<ArticleIcon sx={{ mr: 1 }} />}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="paymentObject.value"
                  control={control}
                  rules={{
                    required: t(
                      'debtPositionCreateWizard.step3.paymentObject.required'
                    )
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t(
                        'debtPositionCreateWizard.step3.paymentObject.label'
                      )}
                      required
                      disabled={data.paymentObject?.readonly}
                      error={isSubmitted && !!errors.paymentObject?.value}
                      helperText={
                        isSubmitted && errors.paymentObject?.value?.message
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        handleFieldChange('paymentObject', value);
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="paymentOption.value"
                  control={control}
                  rules={{
                    required: t(
                      'debtPositionCreateWizard.step3.paymentOption.required'
                    )
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label={t(
                        'debtPositionCreateWizard.step3.paymentOption.label'
                      )}
                      required
                      disabled={data.paymentOption?.readonly}
                      error={isSubmitted && !!errors.paymentOption?.value}
                      helperText={
                        isSubmitted && errors.paymentOption?.value?.message
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        handleFieldChange('paymentOption', value);
                      }}
                    >
                      <MenuItem value="SINGLE">
                        {t(
                          'debtPositionCreateWizard.step3.paymentOption.single'
                        )}
                      </MenuItem>
                      <MenuItem value="INSTALLMENTS">
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
                  rules={{
                    required: {
                      value: true,
                      message: t(
                        'debtPositionCreateWizard.step3.amount.required'
                      )
                    },
                    validate: {
                      positive: (value) => {
                        if (!value) return true; // La validazione required gestisce il caso vuoto
                        const numValue = parseFloat(value);
                        return (
                          numValue > 0 ||
                          t('debtPositionCreateWizard.step3.amount.positive')
                        );
                      },
                      validNumber: (value) => {
                        if (!value) return true; // La validazione required gestisce il caso vuoto
                        return (
                          !isNaN(parseFloat(value)) ||
                          t('debtPositionCreateWizard.step3.amount.validNumber')
                        );
                      }
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('debtPositionCreateWizard.step3.amount.label')}
                      required
                      type="number"
                      disabled={data.amount?.readonly}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">€</InputAdornment>
                        ),
                        inputProps: {
                          min: 0.01,
                          step: 0.01
                        }
                      }}
                      error={isSubmitted && !!errors.amount?.value}
                      helperText={isSubmitted && errors.amount?.value?.message}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        handleFieldChange('amount', value);
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="dueDate.value"
                  control={control}
                  rules={{
                    required: t(
                      'debtPositionCreateWizard.step3.dueDate.required'
                    )
                  }}
                  render={({ field: { onChange, value, ...field } }) => (
                    <DatePicker
                      {...field}
                      value={value}
                      label={t('debtPositionCreateWizard.step3.dueDate.label')}
                      disabled={data.dueDate?.readonly}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: isSubmitted && !!errors.dueDate?.value,
                          helperText:
                            isSubmitted && errors.dueDate?.value?.message
                        }
                      }}
                      onChange={(date) => {
                        onChange(date);
                        // Non convertire la data in stringa qui, mantieni l'oggetto Date
                        handleFieldChange('dueDate', date);
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="isMultibeneficiary.value"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          disabled={data.isMultibeneficiary?.readonly}
                          onChange={(e) => {
                            const value = e.target.checked;
                            field.onChange(value);
                            handleFieldChange('isMultibeneficiary', value);
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
            </Grid>
          </PaperContent>

          <WizardStepButtons
            onBack={onBack}
            onNext={handleSubmit(onSubmit)}
            disableNext={false}
            nextLabel="commons.create"
          />
        </form>
      </SectionBox>
    </Box>
  );
};

export default Step3;
