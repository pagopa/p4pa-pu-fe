import { Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateValidationError } from '@mui/x-date-pickers/models';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateRangeValue } from '../../store/SearchCardStore';

export type DateRange = {
  label?: string;
  errorMessage?: string;
  onChange?: (date: Date | null) => void;
};

export type _DateRangeProps = {
  from?: DateRange;
  to?: DateRange;
  isYear?: boolean;
  required?: boolean;
  value?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
};

export const _DateRange = ({ from, to, isYear, required, value, onChange }: _DateRangeProps) => {
  const [startDate, setStartDate] = useState<Date | null>(value?.from || null);
  const [endDate, setEndDate] = useState<Date | null>(value?.to || null);

  const [startDateError, setStartDateError] = useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(null);

  const [isToDialogOpen, setIsToDialogOpen] = useState<boolean>(false);

  const { t } = useTranslation();


  useEffect(() => {
    if (value) {
      setStartDate(value.from);
      setEndDate(value.to);
    }
  }, [value]);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
 
    if (onChange) {
      onChange({
        from: date,
        to: endDate
      });
    }
    
    from?.onChange?.(date);
  };

  const handleStartDateOnAccept = (date: Date | null) => {
    if (!endDate || (date && date > endDate)) {
      setEndDate(null);
      
      if (onChange) {
        onChange({
          from: date,
          to: null
        });
      }
      
      setIsToDialogOpen(true);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!startDate || (date && date >= startDate)) {
      setEndDate(date);
      
      if (onChange) {
        onChange({
          from: startDate,
          to: date
        });
      }
    }
    
    to?.onChange?.(date);
  };

  return (
    <Stack direction={{ xs: 'row' }} justifyContent="row" gap={2} width="100%">
      <DatePicker
        views={isYear ? ['year'] : ['day', 'month', 'year']}
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
            helperText: startDateError ? (from?.errorMessage ?? t('dates.validations.from')) : '',
            required: required
          }
        }}
        {...from}
        onChange={handleStartDateChange}
      />
      {to && (
        <DatePicker
          views={['day', 'month', 'year']}
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
              helperText: endDateError ? (to?.errorMessage ?? t('dates.validations.to')) : '',
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
