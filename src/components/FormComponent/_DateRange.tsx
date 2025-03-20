import { Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateValidationError } from '@mui/x-date-pickers/models';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type DateRange = {
  label?: string;
  errorMessage?: string;
  onChange?: (date: Date | null) => void;
  value?: Date | null;
};

export type _DateRangeProps = {
  from?: DateRange;
  to?: DateRange;
  isYear?: boolean;
  required?: boolean;
};

export const _DateRange = ({ from, to, isYear, required }: _DateRangeProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [startDateError, setStartDateError] =
    useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(
    null
  );

  const [isToDialogOpen, setIsToDialogOpen] = useState<boolean>(false);

  const { t } = useTranslation();

  const setTimeToStartOfDay = (date: Date | null): Date | null => {
    if (!date) return null;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    );
  };

  const setTimeToEndOfDay = (date: Date | null): Date | null => {
    if (!date) return null;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );
  };

  const handleStartDateChange = (date: Date | null) => {
    const dateWithTime = setTimeToStartOfDay(date);
    setStartDate(dateWithTime);
    from?.onChange?.(dateWithTime);
  };

  const handleStartDateOnAccept = (date: Date | null) => {
    const dateWithTime = setTimeToStartOfDay(date);

    if (dateWithTime && endDate && dateWithTime > endDate) {
      setEndDate(null);
      to?.onChange?.(null);
      setIsToDialogOpen(true);
    } else if (dateWithTime && !endDate) {
      setIsToDialogOpen(true);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) {
      setEndDate(null);
      to?.onChange?.(null);
      return;
    }

    const endOfDayDate = setTimeToEndOfDay(date);

    if (!startDate || (endOfDayDate && endOfDayDate >= startDate)) {
      setEndDate(endOfDayDate);
      to?.onChange?.(endOfDayDate);
    } else {
      to?.onChange?.(null);
    }
  };

  return (
    <Stack direction={{ xs: 'row' }} justifyContent="row" gap={2} width="100%">
      <DatePicker
        views={isYear ? ['year'] : undefined}
        format={isYear ? 'yyyy' : 'dd/MM/yyyy'}
        openTo={isYear ? 'year' : 'day'}
        sx={{ width: '100%' }}
        label={t('dates.from')}
        value={startDate}
        onAccept={handleStartDateOnAccept}
        onError={setStartDateError}
        slotProps={{
          textField: {
            size: 'small',
            variant: 'outlined',
            error: !!startDateError,
            helperText: startDateError
              ? (from?.errorMessage ?? t('dates.validations.from'))
              : '',
            required: required
          }
        }}
        {...from}
        onChange={handleStartDateChange}
      />
      {to && (
        <DatePicker
          sx={{ width: '100%' }}
          label={t('dates.to')}
          value={endDate}
          open={isToDialogOpen}
          onClose={() => setIsToDialogOpen(false)}
          minDate={startDate || undefined}
          onError={setEndDateError}
          slotProps={{
            textField: {
              size: 'small',
              variant: 'outlined',
              error: !!endDateError,
              helperText: endDateError
                ? (to?.errorMessage ?? t('dates.validations.to'))
                : '',
              required: required
            },
            inputAdornment: {
              onClick: () => setIsToDialogOpen(!isToDialogOpen)
            }
          }}
          {...to}
          onChange={handleEndDateChange}
        />
      )}
    </Stack>
  );
};
