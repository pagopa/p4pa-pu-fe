import { useState } from 'react';
import { subMonths, startOfDay, endOfDay } from 'date-fns';
import { DateValidationError } from '@mui/x-date-pickers/models';

type DateRangeState = {
  from: Date | null;
  to: Date | null;
  fromError: DateValidationError | null;
  toError: DateValidationError | null;
};

export const useDateRange = (tabIndex: number, prefilled = true) => {
  const [state, setState] = useState<Array<DateRangeState>>([
    {
      from: prefilled ? startOfDay(subMonths(new Date(), 1)) : null,
      to: prefilled ? endOfDay(new Date()) : null,
      fromError: null,
      toError: null
    },
    {
      from: startOfDay(subMonths(new Date(), 1)),
      to: endOfDay(new Date()),
      fromError: null,
      toError: null
    }
  ]);

  const updateField = (key: keyof DateRangeState, value: unknown) => {
    setState((prev) => ({
      ...prev,
      [tabIndex]: {
        ...prev[tabIndex],
        [key]: value
      }
    }));
  };

  const setFromDate = (d: Date | null) => {
    const value = d
      ? startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
      : null;
    updateField('from', value);

    const currentTo = state[tabIndex].to;
    const error: DateValidationError | null =
      value && currentTo && value > currentTo ? 'invalidDate' : null;

    updateField('toError', error);
  };

  const setToDate = (d: Date | null) => {
    const value = d
      ? endOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
      : null;
    updateField('to', value);

    const currentFrom = state[tabIndex].from;
    const error: DateValidationError | null =
      currentFrom && value && currentFrom > value ? 'invalidDate' : null;

    updateField('toError', error);
  };

  const isDateValid = () => {
    const { from, to, fromError, toError } = state[tabIndex];
    return (
      !fromError &&
      !toError &&
      !!from &&
      !!to &&
      startOfDay(from) <= endOfDay(to)
    );
  };

  return {
    fromDate: state[tabIndex].from,
    toDate: state[tabIndex].to,
    setFromDate,
    setToDate,
    setFromError: (err: DateValidationError | null) =>
      updateField('fromError', err),
    setToError: (err: DateValidationError | null) =>
      updateField('toError', err),
    resetDates: () => {
      updateField('from', startOfDay(subMonths(new Date(), 1)));
      updateField('to', endOfDay(new Date()));
      updateField('fromError', null);
      updateField('toError', null);
    },
    isButtonDisabled: !isDateValid()
  };
};
