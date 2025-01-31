import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Button
} from '@mui/material';
import MultiFilter from '../MultiFilter/MultiFilter';

interface SearchField {
  type: 'input';
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  gridWidth?: number;
}

interface SelectField {
  type: 'select';
  selectLabel: string;
  gridWidth?: number;
  selectOptions: { label: string; value: string }[];
}

interface ButtonField {
  text: string;
  variant?: 'contained' | 'outlined';
  onClick?: () => void;
}

interface MultiFilterConfig {
  enabled: boolean;
  selectLabel: string;
  inputLabel: {
    label: string;
    icon?: React.ReactNode;
  };
  selectOptions: { label: string; value: string }[];
}

type FieldType = SearchField | SelectField;

type SearchCardProps = {
  title: string;
  description: string;
  fields?: FieldType[];
  button?: ButtonField[];
  multiFilterConfig?: MultiFilterConfig;
};

const SearchCard = ({ title, description, fields, button, multiFilterConfig }: SearchCardProps) => {
  return (
    <Box component="section" width="100%" borderRadius={0.5} padding={3} sx={{ backgroundColor: 'background.paper' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{description}</Typography>

      <Grid container spacing={2} alignItems="center">
        {fields && fields.map((field, index) => (
          <Grid item xs={field.gridWidth ?? 12} key={index} display="flex" alignItems="center">
            {field.type === 'input' ? (
              <TextField
                label={field.label}
                placeholder={field.placeholder || ''}
                InputProps={{
                  endAdornment: field.icon ? (
                    <InputAdornment position="end">{field.icon}</InputAdornment>
                  ) : undefined,
                }}
                size="small"
                fullWidth
              />
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel>{field.selectLabel}</InputLabel>
                <Select>
                  {field.selectOptions.map((option, i) => (
                    <MenuItem key={i} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
        ))}

        {multiFilterConfig?.enabled && (
          <Grid item lg={12}>
            <MultiFilter 
              selectLabel={multiFilterConfig.selectLabel} 
              inputLabel={multiFilterConfig.inputLabel}
              selectOptions={multiFilterConfig.selectOptions}
            />
          </Grid>
        )}
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
        {button?.map((btn, index) => (
          <Button key={index} variant={btn.variant} onClick={btn.onClick}>
            {btn.text}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default SearchCard;
