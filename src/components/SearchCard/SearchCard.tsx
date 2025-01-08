import React from 'react';
import { Box, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
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
  selectOptions: {
    label: string;
    value: string;
  }[];
};

const SearchCard = ({ title, description, searchFields, selectOptions }: SearchCardProps) => {

  const [selectedValue, setSelectedValue] = React.useState('');

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      borderRadius="4px"
      padding="24px"
      sx={{ backgroundColor: 'background.paper' }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {description}
      </Typography>

      <Grid container spacing={2}>
        {searchFields.map((field, index) => (
          <Grid item xs={field.gridWidth || 12} key={index} mb={1}>
            <TextField
              label={field.label}
              placeholder={field.placeholder || ''}
              InputProps={{
                endAdornment: field.icon ? (
                  <InputAdornment position="end" sx={{ marginRight: '-16px' }}>{field.icon}</InputAdornment>
                ) : undefined,
              }}
              size="small"
              fullWidth
            />
          </Grid>
        ))}
      </Grid>

      <FormControl fullWidth size="small" sx={{ my: 2 }}>
        <InputLabel id="due-type">Tipo dovuto</InputLabel>
        <Select
          labelId="due-type"
          value={selectedValue}
          onChange={(event) => setSelectedValue(event.target.value)}
          label="Tipo dovuto"
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
