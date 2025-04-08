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

type FormValues = {
  paymentObject: string;
  paymentOption: string;
  amount: string;
  dueDate: Date | null;
  isMultibeneficiary: boolean;
};

type Step3Data = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: string; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: string; readonly: boolean };
  // isMultibeneficiary: { value: boolean; readonly: boolean };
};

type Props = {
  data: Step3Data; // Dati attuali dello step
  setData: (data: Step3Data) => void; // Funzione per aggiornare i dati
  onNext: () => void; // Funzione per passare allo step successivo
  onBack: () => void; // Funzione per tornare allo step precedente
};

const Step3 = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();
  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      paymentObject: data.paymentObject?.value || '',
      paymentOption: data.paymentOption?.value || 'SINGLE',
      amount: data.amount?.value || '',
      dueDate: data.dueDate?.value ? new Date(data.dueDate.value) : null,
      isMultibeneficiary: false
    }
  });

  const onSubmit = (formValues: FormValues) => {
    setData({
      paymentObject: {
        value: formValues.paymentObject,
        readonly: data.paymentObject?.readonly ?? false
      },
      paymentOption: {
        value: formValues.paymentOption,
        readonly: data.paymentOption?.readonly ?? false
      },
      amount: {
        value: formValues.amount,
        readonly: data.amount?.readonly ?? false
      },
      dueDate: {
        value: formValues.dueDate?.toISOString() ?? '',
        readonly: data.dueDate?.readonly ?? false
      }
      // isMultibeneficiary: {
      //   value: formValues.isMultibeneficiary,
      //   readonly: data.isMultibeneficiary?.readonly ?? false
      // }
    });
    onNext();
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
                  name="paymentObject"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Oggetto del pagamento"
                      required
                      disabled={data.paymentObject?.readonly}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="paymentOption"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Opzione di pagamento"
                      required
                      disabled={data.paymentOption?.readonly}
                    >
                      <MenuItem value="SINGLE">Soluzione unica</MenuItem>
                      <MenuItem value="INSTALLMENTS">
                        Soluzione rateale
                      </MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Importo"
                      required
                      type="number"
                      disabled={data.amount?.readonly}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">€</InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Data scadenza"
                      disabled={data.dueDate?.readonly}
                      slotProps={{
                        textField: {
                          fullWidth: true
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="isMultibeneficiary"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          // disabled={data.isMultibeneficiary?.readonly}
                        />
                      }
                      label="Multibeneficiari"
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
          />
        </form>
      </SectionBox>
    </Box>
  );
};

export default Step3;
