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
  'select' | 'type' | 'onChange' | 'value' | 'defaultValue'
> & {
  options?: SelectOptions;
  forwardRef?: React.Ref<HTMLInputElement>;
  onChange?: (value: FilterFieldValue) => void;
  value?: FilterFieldValue; // initial selection (uncontrolled)
  onClose?: () => void; // callback called when the dropdown is closed
};

export const _Select = ({
  forwardRef,
  options = [],
  value,
  onChange,
  onClose,
  label,
  id,
  ...props
}: _SelectProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-vars
  const { defaultValue: _, ...safeProps } = props as typeof props & {
    defaultValue?: unknown;
  };

  // Derive selected option from value prop (fully controlled component)
  const selectedOption = options.find((opt) => opt.value === value) || null;

  // Internal state for input text display
  const [inputValue, setInputValue] = useState('');
  // Track if user clicked the clear button to prevent premature re-sync
  const userClearingRef = useRef(false);
  // State to track if the dropdown is open
  const [isOpen, setIsOpen] = useState(false);

  // Sync inputValue with selectedOption to keep display in sync with form state
  // Special handling: when user clears, wait for value to become undefined/null/empty before syncing
  useEffect(() => {
    // If user is clearing, wait until value is actually cleared (undefined, null, or empty string)
    if (userClearingRef.current) {
      // Consider undefined, null, and empty string as "cleared"
      if (value === undefined || value === null || value === '') {
        userClearingRef.current = false;
        setInputValue('');
      }
      return;
    }
    const newInputValue = selectedOption?.label || '';
    setInputValue(newInputValue);
  }, [selectedOption, value, id]);

  // Handle selection change and notify parent component
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: { label: string; value: FilterFieldValue } | null
  ) => {
    if (newValue) {
      // Set the flag when a value is selected
      // The useEffect that monitors 'value' will handle the focus restoration
      shouldRestoreFocusRef.current = true;
    }

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

  // Ref to track if we should restore focus after dropdown closes
  const shouldRestoreFocusRef = useRef(false);
  // Ref to track the input element
  const inputRef = useRef<HTMLInputElement | null>(null);

  // IMPORTANT: Initialized to undefined to detect the first value change
  const prevValueRef = useRef<FilterFieldValue>(undefined);

  // Effect to restore focus when the value changes after a selection
  // This also handles the case of unmount/remount caused by dynamic keys
  useEffect(() => {
    const valueChanged = prevValueRef.current !== value;
    const hasNewValue = value !== undefined && value !== null && value !== '';

    // Restore the focus if:
    // 1. The flag is set (from handleChange or handleClose with selectOption)
    // 2. Or: the value has changed and there is a new non-empty value
    //    (this covers the case where the component is unmounted/remounted
    //     and the new component receives the updated value as a prop)
    const shouldRestoreFocus =
      shouldRestoreFocusRef.current || (valueChanged && hasNewValue);

    if (shouldRestoreFocus && hasNewValue) {
      // Use requestAnimationFrame to ensure the DOM is updated
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          shouldRestoreFocusRef.current = false;
        }
      });
    }
    // Update the previous value
    prevValueRef.current = value;
  }, [value, id]);

  const handleClose = (_event: React.SyntheticEvent, reason: string) => {
    // Update the state to indicate that the dropdown is closed
    setIsOpen(false);
    // If the dropdown is closed after a selection with selectOption, set the flag to restore focus
    // The actual restoration is handled by the useEffect that reacts to the value change
    // This handles the case of unmount/remount correctly
    if (reason === 'selectOption') {
      shouldRestoreFocusRef.current = true;
    }
    onClose?.();
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
      onOpen={() => setIsOpen(true)}
      onClose={handleClose}
      disableClearable={false}
      disabled={props.disabled}
      getOptionDisabled={(option) => !!option?.disabled}
      filterOptions={(options, state) => {
        // Trim the input to handle the case where the user opens with the spacebar that inserts a space as inputValue instead of simply opening the dropdown
        const trimmedInput = state.inputValue.trim().toLowerCase();
        if (trimmedInput === '') {
          return options;
        }
        return options.filter((option) =>
          option.label.toLowerCase().includes(trimmedInput)
        );
      }}
      renderOption={(props, option, state) => (
        <li {...props} key={`${id}-${state.index}`}>
          {option.label}
        </li>
      )}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            {...safeProps}
            label={label}
            inputRef={(node) => {
              // Handle both our internal ref and the one passed from the outside
              inputRef.current = node;
              if (forwardRef) {
                if (typeof forwardRef === 'function') {
                  forwardRef(node);
                } else {
                  (
                    forwardRef as React.MutableRefObject<HTMLInputElement | null>
                  ).current = node;
                }
              }
            }}
            InputProps={{
              ...params.InputProps
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!isOpen) {
                  e.preventDefault();
                  e.stopPropagation();
                  const input = e.target as HTMLElement;
                  const form = input.closest('form');
                  if (form) {
                    // Use requestAnimationFrame to ensure the event is processed correctly
                    requestAnimationFrame(() => {
                      const submitEvent = new Event('submit', {
                        bubbles: true,
                        cancelable: true
                      });
                      form.dispatchEvent(submitEvent);
                    });
                  }
                }
              }
            }}
          />
        );
      }}
    />
  );
};
