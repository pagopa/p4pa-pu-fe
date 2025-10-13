import Autocomplete from '@mui/material/Autocomplete';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useEffect, useState } from 'react';
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
  onChange?: (value: FilterFieldValue | undefined) => void;
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
  // internal state for selected option object
  const [selectedOption, setSelectedOption] = useState<SelectItem | null>(null);

  // update internal state when value prop changes
  useEffect(() => {
    setSelectedOption(options.find((opt) => opt.value === value) || null);
  }, [options, value]);

  // internal state for input text display
  const [inputValue, setInputValue] = useState('');

  // handle selection change to update internal state and notify parent
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: { label: string; value: FilterFieldValue } | null
  ) => {
    setSelectedOption(newValue);
    onChange?.(newValue ? newValue.value : undefined);
  };

  // handle input change for display value
  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string
  ) => {
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
