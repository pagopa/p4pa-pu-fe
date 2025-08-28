import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import { useState, useEffect } from 'react';
import { _TextField, _TextFieldProps } from './_TextField';
import {
  formatAmountForDisplay,
  isValidAmountInput,
  sanitizeAmountInput
} from '../../utils/formatters';

type TextFieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;

export type AmountFieldProps = {
  value?: unknown;
  onChange?: (event: TextFieldChangeEvent) => void;
} & Omit<_TextFieldProps, 'onChange' | 'value'>;

export const _AmountField = ({
  value,
  onChange,
  ...props
}: AmountFieldProps) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(formatAmountForDisplay(value));
  }, [value]);

  const handleChange = (event: TextFieldChangeEvent) => {
    const inputValue = event.target.value;

    if (inputValue === '') {
      setDisplayValue('');
      if (onChange) {
        const modifiedEvent = {
          ...event,
          target: {
            ...event.target,
            value: ''
          }
        } as TextFieldChangeEvent;
        onChange(modifiedEvent);
      }
      return;
    }

    const cleanedInput = sanitizeAmountInput(inputValue);

    if (isValidAmountInput(cleanedInput)) {
      setDisplayValue(cleanedInput);

      if (onChange) {
        const internalValue = cleanedInput.replace(',', '.');
        const modifiedEvent = {
          ...event,
          target: {
            ...event.target,
            value: internalValue
          }
        } as TextFieldChangeEvent;
        onChange(modifiedEvent);
      }
    }
  };

  return (
    <_TextField
      {...props}
      adornment={<EuroRoundedIcon />}
      value={displayValue}
      onChange={handleChange}
      inputProps={{
        inputMode: 'decimal',
        pattern: '[0-9]*[,.]?[0-9]*'
      }}
      placeholder="0,00"
    />
  );
};
