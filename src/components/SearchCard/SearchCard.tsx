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
} from '@mui/material';
import { SearchButton } from '../SearchButton';

type SearchCardProps = {
  title: string;
  description: string;
  searchFields?: {
    label: string;
    placeholder?: string;
    icon?: React.ReactNode;
    gridWidth?: number;
  }[];
  selectField?: {
    selectLabel?: string;
    selectOptions?: {
      label: string;
      value: string;
    }[];
  }[];
  button?: {
    text: string;
    variant?: 'contained' | 'outlined'
    onClick?: () => void;
  }[];
};

const SearchCard = ({ title, description, searchFields, selectField, button }: SearchCardProps) => {
  const [selectedValue, setSelectedValue] = React.useState('');
  return (
    <Box
      component={'section'}
      aria-label={title}
      display="flex"
      flexDirection="column"
      width="100%"
      borderRadius={0.5}
      padding={3}
      sx={{ backgroundColor: 'background.paper' }}
    >
      <Typography id="search-card-title" variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography
        id="search-card-description"
        variant="body2"
        sx={{ color: 'text.secondary', mb: 2 }}
      >
        {description}
      </Typography>

      <Grid container spacing={2} role="group" aria-labelledby="search-card-fields">
        {searchFields?.map((field, index) => (
          <Grid item xs={field.gridWidth || 12} key={index} mb={1}>
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
          </Grid>
        ))}
      </Grid>
      
      {selectField?.map((field, index) => 
        <FormControl
          fullWidth
          size="small"
          key={index}
          sx={{ my: 2 }}
          role="combobox"
          aria-labelledby={`select-label-${index}`}
        >
          <InputLabel id={`select-label-${index}`}>{field.selectLabel}</InputLabel>
          <Select
            labelId={`select-label-${index}`}
            value={selectedValue}
            onChange={(event) => setSelectedValue(event.target.value)}
            label={field.selectLabel}
          >
            {field.selectOptions?.map((option, index) => (
              <MenuItem key={`${option.label}-${option.value}-${index}`} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
        {button?.map((field, index) => 
          <SearchButton
            key={index}
            text={field.text}
            onClick={field.onClick}
            variant={field.variant}
          />
        )}
      </Box>
    </Box>

  );
};

export default SearchCard;
