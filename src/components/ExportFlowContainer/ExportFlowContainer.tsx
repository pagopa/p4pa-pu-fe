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
  GridDirection,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type ExportFlowContainerProps = {
  section: {
    direction: GridDirection,
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
      fieldKey?: string;
    }[];
    selectOptions?: {
      label: string;
      value: string;
    }[];
  }[];
  formData: { [key: string]: string };
  onSelectChange: (field: string, value: string) => void;
};

const ExportFlowContainer = ({ section, formData, onSelectChange }: ExportFlowContainerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      borderRadius={2}
      padding={3}
      mb={3}
      bgcolor={theme.palette.common.white}
    >
      <Typography variant="h6" mb={1}>
        {t('exportFlow.formTitle')}
      </Typography>
      <Typography variant="body2" color={theme.palette.text.primary} mb={2}>
        {t('exportFlow.formDescription')}
      </Typography>
      <Typography variant="body2" color={theme.palette.error.dark} mb={4}>
        {t('commons.requiredFieldDescription')}
      </Typography>
      <Stack spacing={3}>
        {section.map((item, index) => (
          <Grid
            key={index}
            container
            direction={item.direction}
            justifyContent={'start'}
            border={1}
            borderRadius={2}
            padding={3}
            borderColor={theme.palette.divider}
            bgcolor={theme.palette.common.white}
          >
            <Grid item lg={12}>
              <Typography variant="subtitle1" display={'flex'} color={theme.palette.text.primary} alignItems={'center'} mb={2}>
                <Box display={'flex'} alignItems={'center'}>
                  {item.title.icon}
                </Box>
                {item.title.label}
              </Typography>
            </Grid>
            <Grid container spacing={2}>
              <Grid item lg={12}>
                {item.selectOptions ? (
                  item.inputFields.map((field, index) => (
                    <FormControl key={index} fullWidth size="small" role="combobox" aria-labelledby="select-label">
                      <InputLabel required={field?.required} id="select-label">
                        {field.label}
                      </InputLabel>
                      <Select
                        fullWidth
                        required={field?.required}
                        labelId="select-label"
                        value={formData[field?.fieldKey || '']}
                        onChange={(event) => onSelectChange(field?.fieldKey || '', event.target.value)}
                        label={field.label}
                      >
                        {item.selectOptions &&
                        item.selectOptions.map((option, index) => (
                          <MenuItem key={index} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ))
                ) : (
                  <Grid container direction={'row'} spacing={2}>
                    {item.inputFields.map((field, index) => (
                      <Grid item lg={field.gridWidth} key={index}>
                        <TextField
                          required={field?.required}
                          sx={{ bgcolor: theme.palette.common.white }}
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: field.icon ? <InputAdornment position="end">{field.icon}</InputAdornment> : undefined,
                          }}
                          label={field.label}
                          value={formData[field?.fieldKey || '']}
                          onChange={(event) => onSelectChange(field?.fieldKey || '', event.target.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Stack>
    </Box>
  );
};

export default ExportFlowContainer;
