import { Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateValidationError } from '@mui/x-date-pickers/models';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type DateRange = {
  label?: string;
  errorMessage?: string;
  onChange?: (date: Date | null) => void;
};

export type DateRangeProps = {
  from?: DateRange;
  to?: DateRange;
};

export const DateRange = ({ from, to }: DateRangeProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [startDateError, setStartDateError] = useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(null);

  const [isToDialogOpen, setIsToDialogOpen] = useState<boolean>(false);

  const { t } = useTranslation();

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    from?.onChange?.(date);
  };

  const handleStartDateOnAccept = (date: Date | null) => {
    if (!endDate || (date && date > endDate)) {
      setEndDate(null);
      setIsToDialogOpen(true);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!startDate || (date && date >= startDate)) {
      setEndDate(date);
    }
    to?.onChange?.(date);
  };

  return (
    <Stack direction={{ xs: 'row' }} justifyContent="row" gap={2} width="100%">
      <DatePicker
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
            helperText: startDateError ? (from?.errorMessage ?? t('dates.validations.from')) : '',
          }
        }}
        {...from}
        onChange={handleStartDateChange}
      />
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
            helperText: endDateError ? (to?.errorMessage ?? t('dates.validations.to')) : ''
          },
          inputAdornment: {
            onClick: () => setIsToDialogOpen(!isToDialogOpen)
          }
        }}
        {...to}
        onChange={handleEndDateChange}
      />
    </Stack>
  );
};
