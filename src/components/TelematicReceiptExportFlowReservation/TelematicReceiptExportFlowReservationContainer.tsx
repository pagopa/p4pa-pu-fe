import React from 'react';
import {
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  TextField,
  InputAdornment,
  Box,
} from '@mui/material';

type TelematicReceiptExportFlowReservationContainerProps = {
  title: {
    icon: React.ReactNode;
    label: string;
  },
  inputFields: {
    label: string;
    placeholder?: string;
    gridWidth?: number;
    icon?: React.ReactNode;
    required?: boolean;
  }[];
  isSelectInput?: boolean;
  selectOptions?: {
    label: string;
    value: string;
  }[];
};

const TelematicReceiptExportFlowReservationContainer = ({ title, inputFields, isSelectInput, selectOptions }: TelematicReceiptExportFlowReservationContainerProps) => {
  const [selectedValue, setSelectedValue] = React.useState('');
  const theme = useTheme();

  return (
    <>
      <Grid item lg={12}>
        <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box display={'flex'} alignItems={'center'}>
            {title.icon}
          </Box>
          {title.label}
        </Typography>
      </Grid>
      <Grid container>
        <Grid item lg={12}>
          {isSelectInput ?
            inputFields.map( (field, index) =>
              <FormControl
                key={index}
                fullWidth
                size="small"
                role="combobox"
                aria-labelledby="select-label"
              >
                <InputLabel required = {field?.required} id="select-label">{field.label}</InputLabel>
                <Select
                  fullWidth
                  required = {field?.required}
                  labelId="select-label"
                  value={selectedValue}
                  onChange={(event) => setSelectedValue(event.target.value)}
                  label={field.label}
                >
                  {selectOptions && selectOptions.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
            : 
            <Grid container direction={'row'} spacing={2}>
              {inputFields.map( (field, index) =>
                <Grid item lg={field.gridWidth} key={index}>
                  <TextField
                    required = {field?.required}
                    sx={{ bgcolor: theme.palette.common.white }}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: field.icon ? (
                        <InputAdornment position="end">{field.icon}</InputAdornment>
                      ) : undefined,
                    }}
                    label={field.label}
                  />
                </Grid>

              )
              }
            </Grid>
          }
        </Grid>
      </Grid>
    </>
  );
};

export default TelematicReceiptExportFlowReservationContainer;
