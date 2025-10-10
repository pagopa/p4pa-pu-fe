import Autocomplete, {
  AutocompleteInputChangeReason
} from '@mui/material/Autocomplete';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useState, useEffect, useRef } from 'react';
import { FilterFieldValue } from '../../models/Filters';

export type SelectItem = {
  label: string;
  value: FilterFieldValue;
  flagMandatoryDueDate?: boolean;
  disabled?: boolean;
};

export type SelectOptions = Array<SelectItem>;

export type _SelectProps = Omit<
  TextFieldProps,
  'select' | 'type' | 'onChange' | 'value'
> & {
  options?: SelectOptions;
  forwardRef?: React.Ref<HTMLInputElement>;
  onChange?: (value: FilterFieldValue) => void;
  value?: FilterFieldValue; // initial selection (uncontrolled)
};

export const _Select = ({
  forwardRef,
  options = [],
  value,
  onChange,
  label,
  id,
  ...props
}: _SelectProps) => {
  // Derive selected option from value prop (fully controlled component)
  const selectedOption = options.find((opt) => opt.value === value) || null;

  // Internal state for input text display
  const [inputValue, setInputValue] = useState('');
  // Track if user clicked the clear button to prevent premature re-sync
  const userClearingRef = useRef(false);

  // Sync inputValue with selectedOption to keep display in sync with form state
  // Special handling: when user clears, wait for value to become undefined before syncing
  useEffect(() => {
    // If user is clearing, wait until value is actually undefined
    if (userClearingRef.current) {
      if (value === undefined || value === null) {
        // Clear completed, reset flag and sync empty string
        userClearingRef.current = false;
        setInputValue('');
      }
      // Still waiting for clear to complete, skip sync
      return;
    }

    // Normal sync: update inputValue to match selected option
    const newInputValue = selectedOption?.label || '';
    setInputValue(newInputValue);
  }, [selectedOption, value, id]);

  // Handle selection change and notify parent component
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: { label: string; value: FilterFieldValue } | null
  ) => {
    onChange?.(newValue ? newValue.value : undefined);
  };

  // Handle input text changes (typing, clearing, etc.)
  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string,
    reason: AutocompleteInputChangeReason
  ) => {
    // User clicked clear button: mark as clearing and let useEffect handle the sync
    if (reason === 'clear') {
      userClearingRef.current = true;
      return;
    }

    // Block MUI's automatic reset during clearing to prevent flickering
    if (reason === 'reset' && userClearingRef.current) {
      return;
    }

    // Normal input change: update display value
    setInputValue(newInputValue);
  };

  return (
    <Autocomplete
      fullWidth
      size="small"
      id={id}
      data-testid={id}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      disableClearable={false}
      disabled={props.disabled}
      getOptionDisabled={(option) => !!option?.disabled}
      renderOption={(props, option) => (
        <li {...props} key={`${label}-${option.value}`}>
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          inputRef={forwardRef}
          {...props}
          InputProps={{
            ...params.InputProps
          }}
        />
      )}
    />
  );
};
