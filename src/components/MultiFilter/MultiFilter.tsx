import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment
} from '@mui/material';
import { Add, RemoveCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface FilterRow {
  selectedValue: string;
  inputValue: string;
}

interface InputLabel {
  label: string;
  icon?: React.ReactNode;
}

interface SelectOption {
  label: string;
  value: string;
}

interface MultiFilterProps {
  selectLabel: string;
  inputLabel: InputLabel;
  selectOptions: SelectOption[];
}

const MultiFilter = ({ selectLabel, inputLabel, selectOptions }: MultiFilterProps) => {
  const [filters, setFilters] = useState<FilterRow[]>([{ selectedValue: '', inputValue: '' }]);
  
  const { t } = useTranslation();

  const addFilterRow = () => {
    setFilters([...filters, { selectedValue: '', inputValue: '' }]);
  };

  const removeFilterRow = (index: number) => {
    if (index > 0) {
      setFilters(filters.filter((_, i) => i !== index));
    }
  };

  const handleSelectChange = (index: number, value: string) => {
    const newFilters = [...filters];
    newFilters[index].selectedValue = value;
    setFilters(newFilters);
  };

  const handleInputChange = (index: number, value: string) => {
    const newFilters = [...filters];
    newFilters[index].inputValue = value;
    setFilters(newFilters);
  };

  return (
    <Box>
      {filters.map((filter, index) => (
        <Grid container spacing={2} key={index} alignItems="center" mt={index > 0 ? 1 : 0}>
          
          {index > 0 && (
            <Grid item xs={1} display="flex" justifyContent="center">
              <Button
                onClick={() => removeFilterRow(index)}
                variant="text"
                color="error"
              >
                <RemoveCircleOutline fontSize="small" />
              </Button>
            </Grid>
          )}

          <Grid item md={4} lg={4}>
            <FormControl fullWidth size="small">
              <InputLabel id={`select-label-${index}`}>{selectLabel}</InputLabel>
              <Select
                value={filter.selectedValue}
                labelId={`select-label-${index}`}
                label={selectLabel}
                onChange={(e) => handleSelectChange(index, e.target.value)}
              >
                {selectOptions.map((option, i) => (
                  <MenuItem key={i} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item md={index === 0 ? 8 : 7} lg={index === 0 ? 8 : 7}>
            <TextField
              label={inputLabel.label}
              value={filter.inputValue}
              onChange={(e) => handleInputChange(index, e.target.value)}
              disabled={!filter.selectedValue}
              InputProps={{
                endAdornment: inputLabel.icon ? (
                  <InputAdornment position="end">{inputLabel.icon}</InputAdornment>
                ) : undefined,
              }}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      ))}

      <Box display="flex" justifyContent="flex-start" mt={2}>
        <Button variant="text" onClick={addFilterRow} startIcon={<Add />}>
          {t('commons.addfilter')}
        </Button>
      </Box>
    </Box>
  );
};

export default MultiFilter;
