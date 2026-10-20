import WizardStepWrapper from '@core/components/Wizard/WizardStepWrapper';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const PagoPAIntegration = ({ availableApiKeys }: { availableApiKeys: string[] }) => {
  return (
    <WizardStepWrapper
      title="Seleziona il prodotto PagoPA"
      subtitle="Indica quale prodotto vuoi integrare"
      sx={{ marginTop: 2 }}
    >
      <FormControl fullWidth>
        <InputLabel id="api-Key-list">API Key</InputLabel>
        <Select labelId="api-Key-list" label="API Key">
          {availableApiKeys.map((keyType) => (
            <MenuItem value={keyType} key={keyType}>
              {keyType}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </WizardStepWrapper>
  );
};

export default PagoPAIntegration;
