import { Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateValidationError } from '@mui/x-date-pickers/models';
import { endOfDay, startOfDay, format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

//Generates an accessible label for the calendar open button. If there is a value, shows "Change date, [formatted date]", otherwise "Choose date".

const getDatePickerAriaLabel = (
  t: (key: string) => string,
  value: Date | null | undefined,
  label?: string
): string => {
  if (value) {
    // Checks if the date is valid before formatting it
    const isValidDate = value instanceof Date && !isNaN(value.getTime());

    if (!isValidDate) {
      const baseLabel = t('dates.chooseDate');
      return label ? `${baseLabel}, ${label}` : baseLabel;
    }

    const formattedDate = format(value, 'dd/MM/yyyy');
    return `${t('dates.changeDate')}, ${formattedDate}`;
  }
  const baseLabel = t('dates.chooseDate');
  return label ? `${baseLabel}, ${label}` : baseLabel;
};

export type DateRange = {
  label?: string;
  errorMessage?: string;
  onChange?: (date: Date | null) => void;
  value?: Date | null;
  todayValue?: Date;
};

export type _DateRangeProps = {
  from?: DateRange;
  to?: DateRange;
  isYear?: boolean;
  required?: boolean;
  onFromErrorChange?: (error: DateValidationError | null) => void;
  onToErrorChange?: (error: DateValidationError | null) => void;
  rangeLabel?: string;
  shouldValidate?: boolean;
  validationErrorMessage?: string;
  validatePartialRange?: boolean;
};

export const _DateRange = ({
  from,
  to,
  isYear,
  required,
  onFromErrorChange,
  onToErrorChange,
  rangeLabel,
  shouldValidate = false,
  validationErrorMessage,
  validatePartialRange = true
}: _DateRangeProps) => {
  const { t } = useTranslation();
  const [startDateError, setStartDateError] =
    useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(
    null
  );
  const [isToDialogOpen, setIsToDialogOpen] = useState<boolean>(false);
  const [partialFromError, setPartialFromError] = useState<string>('');
  const [partialToError, setPartialToError] = useState<string>('');

  useEffect(() => {
    if (!validatePartialRange) return;

    const hasFrom = Boolean(from?.value);
    const hasTo = Boolean(to?.value);

    setPartialFromError('');
    setPartialToError('');

    if (hasFrom && !hasTo) {
      setPartialToError(t('dates.validations.insertTo'));
    } else if (!hasFrom && hasTo) {
      setPartialFromError(t('dates.validations.insertFrom'));
    }
  }, [from?.value, to?.value, validatePartialRange]);

  const handleStartDateChange = (date: Date | null) => {
    from?.onChange?.(date);
    if (!!date && to?.value && date > to.value) {
      to?.onChange?.(null);
    }
  };

  const handleStartDateOnAccept = (date: Date | null) => {
    if (!startDateError || date) {
      if (date && to?.value && date > to.value) {
        to?.onChange?.(null);
      }
      setIsToDialogOpen(true);

      if (startDateError && date) {
        setStartDateError(null);
        from?.onChange?.(date);
      }
    }
  };

  const handleStartDateError = (error: DateValidationError | null) => {
    setStartDateError(error);
    onFromErrorChange?.(error);
    if (error) {
      setIsToDialogOpen(false);
    }
  };

  const isFromMissingOnSubmit =
    shouldValidate && !!validationErrorMessage && !from?.value;
  const isToMissingOnSubmit =
    shouldValidate && !!validationErrorMessage && !to?.value;

  const fromHasError =
    Boolean(startDateError) ||
    isFromMissingOnSubmit ||
    Boolean(partialFromError);

  const toHasError =
    Boolean(endDateError) || isToMissingOnSubmit || Boolean(partialToError);

  let fromHelperText = '';
  if (startDateError) {
    fromHelperText = from?.errorMessage ?? t('dates.validations.from');
  } else if (partialFromError) {
    fromHelperText = partialFromError;
  } else if (isFromMissingOnSubmit) {
    fromHelperText = validationErrorMessage || '';
  }

  let toHelperText = '';
  if (endDateError) {
    toHelperText = to?.errorMessage ?? t('dates.validations.to');
  } else if (partialToError) {
    toHelperText = partialToError;
  } else if (isToMissingOnSubmit) {
    toHelperText = validationErrorMessage || '';
  }

  // Pre-process the dates to avoid calling startOfDay/endOfDay with invalid dates
  let fromDateValue = null;
  if (from?.value) {
    const isValidFromDate = !isNaN(from.value.getTime());
    if (isValidFromDate) {
      fromDateValue = startOfDay(from.value);
    }
  }

  let toDateValue = null;
  if (to?.value) {
    const isValidToDate = !isNaN(to.value.getTime());
    if (isValidToDate) {
      toDateValue = endOfDay(to.value);
    }
  }

  return (
    <Stack spacing={1} width="100%">
      {rangeLabel && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {rangeLabel}
        </Typography>
      )}

      <Stack
        direction={{ xs: 'row' }}
        justifyContent="row"
        gap={2}
        width="100%"
      >
        <DatePicker
          views={isYear ? ['year'] : undefined}
          format={isYear ? 'yyyy' : 'dd/MM/yyyy'}
          openTo={isYear ? 'year' : 'day'}
          maxDate={from?.todayValue || undefined}
          sx={{ width: '100%' }}
          label={from?.label || t('dates.from')}
          value={fromDateValue}
          onChange={handleStartDateChange}
          onAccept={handleStartDateOnAccept}
          onError={handleStartDateError}
          slotProps={{
            textField: {
              size: 'small',
              variant: 'outlined',
              error: fromHasError,
              helperText: fromHelperText,
              required
            },
            openPickerButton: {
              'aria-label': getDatePickerAriaLabel(t, from?.value, from?.label)
            }
          }}
        />

        {to && (
          <DatePicker
            sx={{ width: '100%' }}
            label={t('dates.to')}
            value={toDateValue}
            onChange={to?.onChange}
            open={isToDialogOpen}
            onClose={() => setIsToDialogOpen(false)}
            onError={(err) => {
              setEndDateError(err);
              onToErrorChange?.(err);
            }}
            maxDate={to?.todayValue || undefined}
            minDate={from?.value || undefined}
            slotProps={{
              textField: {
                size: 'small',
                variant: 'outlined',
                error: toHasError,
                helperText: toHelperText,
                required
              },
              inputAdornment: {
                onClick: () => setIsToDialogOpen(!isToDialogOpen)
              },
              openPickerButton: {
                'aria-label': getDatePickerAriaLabel(t, to?.value, to?.label)
              }
            }}
          />
        )}
      </Stack>
    </Stack>
  );
};
