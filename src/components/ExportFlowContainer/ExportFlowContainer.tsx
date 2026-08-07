import React, { useState } from 'react';
import {
  Grid,
  Typography,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  TextField,
  InputAdornment,
  Box,
  GridDirection,
  Stack
} from '@mui/material';
import { useTranslation } from 'react-i18next';

type ExportFlowContainerProps = {
  section: Array<{
    direction: GridDirection;
    title: {
      icon: React.ReactNode;
      label: string;
    };
    inputFields: Array<{
      label: string;
      placeholder?: string;
      gridWidth?: number;
      icon?: React.ReactNode;
      required?: boolean;
      fieldKey?: string;
    }>;
    selectOptions?: Array<{
      label: string;
      value: string | number;
    }>;
    dateRange?: React.ReactNode;
  }>;
  formData: Record<string, string>;
  onSelectChange: (field: string, value: string) => void;
  // set once the user tries to submit: surfaces errors on fields never touched
  submitted?: boolean;
};

const selectFieldId = (fieldKey: string) => `select-${fieldKey}`;

const ExportFlowContainer = ({
  section,
  formData,
  onSelectChange,
  submitted = false
}: ExportFlowContainerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (fieldKey: string) =>
    setTouched((prev) => ({ ...prev, [fieldKey]: true }));

  type SectionItem = ExportFlowContainerProps['section'][number];

  const renderFields = (
    item: SectionItem,
    sectionIndex: number
  ): JSX.Element => {
    if (item.dateRange) {
      return <React.Fragment>{item.dateRange}</React.Fragment>;
    }

    if (item.selectOptions) {
      return (
        <React.Fragment>
          {item.inputFields.map((field, index) => {
            const fieldKey = field?.fieldKey ?? '';
            const hasError =
              !!field?.required &&
              (!!touched[fieldKey] || submitted) &&
              !formData[fieldKey];
            // ids must stay unique across sections: the field index alone repeats
            const labelId = `select-label-${sectionIndex}-${index}`;
            const helperId = `select-helper-${sectionIndex}-${index}`;

            return (
              <FormControl key={index} fullWidth size="small" error={hasError}>
                <InputLabel required={field?.required} id={labelId}>
                  {field.label}
                </InputLabel>
                <Select
                  fullWidth
                  required={field?.required}
                  id={selectFieldId(fieldKey)}
                  labelId={labelId}
                  aria-describedby={hasError ? helperId : undefined}
                  // MUI puts required/invalid on the hidden native input only:
                  // the element screen readers focus is this display div
                  SelectDisplayProps={{
                    'aria-required': field?.required || undefined,
                    'aria-invalid': hasError || undefined
                  }}
                  value={formData[fieldKey] ?? ''}
                  onChange={(event) =>
                    onSelectChange(fieldKey, event.target.value)
                  }
                  onBlur={() => markTouched(fieldKey)}
                  label={field.label}
                >
                  {item?.selectOptions?.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {hasError && (
                  <FormHelperText id={helperId}>
                    {t('commons.required')}
                  </FormHelperText>
                )}
              </FormControl>
            );
          })}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Grid container direction="row" spacing={2}>
          {item.inputFields.map((field, index) => (
            <Grid item lg={field.gridWidth} key={index}>
              <TextField
                required={field?.required}
                sx={{ bgcolor: theme.palette.common.white }}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: field.icon ? (
                    <InputAdornment position="end">{field.icon}</InputAdornment>
                  ) : undefined
                }}
                label={field.label}
                value={formData[field?.fieldKey || ''] ?? ''}
                onChange={(event) =>
                  onSelectChange(field?.fieldKey ?? '', event.target.value)
                }
              />
            </Grid>
          ))}
        </Grid>
      </React.Fragment>
    );
  };

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
              <Typography
                variant="subtitle1"
                display={'flex'}
                color={theme.palette.text.primary}
                alignItems={'center'}
                mb={2}
              >
                <Box display={'flex'} alignItems={'center'}>
                  {item.title.icon}
                </Box>
                {item.title.label}
              </Typography>
            </Grid>
            <Grid container spacing={2}>
              <Grid item lg={12}>
                {renderFields(item, index)}
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Stack>
    </Box>
  );
};

export default ExportFlowContainer;
