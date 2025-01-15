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
  searchFields: {
    label: string;
    placeholder?: string;
    icon?: React.ReactNode;
    gridWidth?: number;
  }[];
  selectLabel: string;
  selectOptions: {
    label: string;
    value: string;
  }[];
};

const SearchCard = ({ title, description, searchFields, selectLabel, selectOptions }: SearchCardProps) => {
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
        {searchFields.map((field, index) => (
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

      <FormControl
        fullWidth
        size="small"
        sx={{ my: 2 }}
        role="combobox"
        aria-labelledby="due-type-label"
      >
        <InputLabel id="due-type-label">{selectLabel}</InputLabel>
        <Select
          labelId="due-type-label"
          value={selectedValue}
          onChange={(event) => setSelectedValue(event.target.value)}
          label={selectLabel}
        >
          {selectOptions.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" justifyContent="flex-end" mt={1}>
        <SearchButton />
      </Box>
    </Box>
  );
};

export default SearchCard;
