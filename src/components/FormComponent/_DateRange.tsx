import { Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateValidationError } from '@mui/x-date-pickers/models';
import { endOfDay, startOfDay } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
};

export const _DateRange = ({
  from,
  to,
  isYear,
  required,
  onFromErrorChange,
  onToErrorChange
}: _DateRangeProps) => {
  const { t } = useTranslation();
  const [startDateError, setStartDateError] =
    useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(
    null
  );
  const [isToDialogOpen, setIsToDialogOpen] = useState<boolean>(false);

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

  return (
    <Stack direction={{ xs: 'row' }} justifyContent="row" gap={2} width="100%">
      <DatePicker
        views={isYear ? ['year'] : undefined}
        format={isYear ? 'yyyy' : 'dd/MM/yyyy'}
        openTo={isYear ? 'year' : 'day'}
        maxDate={from?.todayValue || undefined}
        sx={{ width: '100%' }}
        label={t('dates.from')}
        value={from?.value && startOfDay(from?.value)}
        onChange={handleStartDateChange}
        onAccept={handleStartDateOnAccept}
        onError={handleStartDateError}
        slotProps={{
          textField: {
            size: 'small',
            variant: 'outlined',
            error: !!startDateError,
            helperText: startDateError
              ? (from?.errorMessage ?? t('dates.validations.from'))
              : '',
            required
          }
        }}
      />

      {to && (
        <DatePicker
          sx={{ width: '100%' }}
          label={t('dates.to')}
          value={to?.value && endOfDay(to?.value)}
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
              error: !!endDateError,
              helperText: endDateError
                ? (to?.errorMessage ?? t('dates.validations.to'))
                : '',
              required
            },
            inputAdornment: {
              onClick: () => setIsToDialogOpen(!isToDialogOpen)
            }
          }}
        />
      )}
    </Stack>
  );
};
