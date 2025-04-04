import { useStore } from '../../../store/GlobalStore';
import { useDebtPositionsTypeOrg } from '../../../hooks/useDebtPositionsTypeOrg';
import SectionBox from './SectionBox';
import { Box, MenuItem, TextField } from '@mui/material';
import WizardStepButtons from './WizardStepButtons';

type Step1Data = {
  tipoDovuto: {
    value: string;
    readonly: boolean;
  };
  descrizione: {
    value: string;
    readonly: boolean;
  };
};

type Props = {
  data: Step1Data;
  setData: (data: Step1Data) => void;
  onNext: () => void;
  onBack?: () => void;
};

const Step1GeneralConfiguration = ({ data, setData, onNext }: Props) => {
  const {
    state: { organizationId }
  } = useStore();

  const { optionsMap: debtPositionsTypes, isLoading } = useDebtPositionsTypeOrg(
    {
      organizationId
    }
  );

  const handleNext = () => {
    onNext();
  };

  return (
    <Box>
      <SectionBox title="Descrizione">
        <TextField
          label="Tipo di dovuto"
          select
          required
          fullWidth
          margin="normal"
          disabled={data.descrizione.readonly}
          value={data.tipoDovuto.value}
          onChange={(e) =>
            setData({
              ...data,
              tipoDovuto: {
                value: e.target.value,
                readonly: data.tipoDovuto.readonly
              }
            })
          }
        >
          {!isLoading && debtPositionsTypes.length === 0 && (
            <MenuItem disabled>Nessun tipo disponibile</MenuItem>
          )}

          {debtPositionsTypes.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value.toString()}
              disabled={data.tipoDovuto.readonly}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Descrizione Posizione Debitoria"
          fullWidth
          margin="normal"
          value={data.descrizione.value}
          disabled={data.descrizione.readonly}
          onChange={(e) =>
            setData({
              ...data,
              descrizione: {
                value: e.target.value,
                readonly: data.descrizione.readonly
              }
            })
          }
        />
        <WizardStepButtons
          // onBack={onBack}
          onNext={handleNext}
          disableNext={data.tipoDovuto.value === ''}
          disableBack={true}
        />
      </SectionBox>
    </Box>
  );
};

export default Step1GeneralConfiguration;
