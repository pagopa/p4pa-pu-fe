import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import { useEffect, useRef, useState } from 'react';
import { _TextField, _TextFieldProps } from './_TextField';
import {
  formatAmountForDisplay,
  isValidAmountInput,
  sanitizeAmountInput,
  parseAmountToNumber
} from '../../utils/formatters';

type TextFieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;

export type AmountFieldProps = {
  value?: unknown;
  onChange?: (event: TextFieldChangeEvent) => void;
  onBlur?: (event: TextFieldChangeEvent) => void;
  onFocus?: (event: TextFieldChangeEvent) => void;
} & Omit<_TextFieldProps, 'onChange' | 'value'>;

export const _AmountField = ({
  value,
  onChange,
  onBlur,
  onFocus,
  ...props
}: AmountFieldProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const isFocused = useRef(false);

  useEffect(() => {
    if (isFocused.current) return;
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

  const handleBlur = (event: TextFieldChangeEvent) => {
    isFocused.current = false;

    if (displayValue !== '') {
      const num = parseAmountToNumber(displayValue);
      if (num !== null) {
        const formattedDot = num.toFixed(2);
        const formattedDisplay = formattedDot.replace('.', ',');
        setDisplayValue(formattedDisplay);

        if (onChange) {
          const modifiedEvent = {
            ...event,
            target: {
              ...event.target,
              value: formattedDot
            }
          } as TextFieldChangeEvent;
          onChange(modifiedEvent);
        }
      }
    }

    if (onBlur) {
      onBlur(event);
    }
  };

  const handleFocus = (event: TextFieldChangeEvent) => {
    isFocused.current = true;
    if (onFocus) {
      onFocus(event);
    }
  };

  return (
    <_TextField
      {...props}
      adornment={<EuroRoundedIcon />}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      inputProps={{
        inputMode: 'decimal',
        pattern: '[0-9]*[,.]?[0-9]*'
      }}
      placeholder="0,00"
    />
  );
};
