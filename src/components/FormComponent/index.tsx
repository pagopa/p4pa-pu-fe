import { _AmountField } from './_AmountField';
import { _Button, _ButtonProps } from './_Button';
import {
  _ControlledTextField,
  _ControlledTextFieldProps
} from './_ControlledTextField';
import { _DateRange, _DateRangeProps } from './_DateRange';
import { _Select, _SelectProps } from './_Select';
import { _ControlledSelect, _ControlledSelectProps } from './_ControlledSelect';
import { _TextField, _TextFieldProps } from './_TextField';
import {
  _ControlledRadioGroup,
  _ControlledRadioGroupProps
} from './_ControlledRadioGroup';

export const FormComponent = {
  AmountField: _AmountField,
  Button: _Button,
  ControlledSelect: _ControlledSelect,
  ControlledTextField: _ControlledTextField,
  ControlledRadioGroup: _ControlledRadioGroup,
  DateRange: _DateRange,
  Select: _Select,
  TextField: _TextField
};

export type {
  _ButtonProps as ButtonProps,
  _ControlledSelectProps as ControlledSelectProps,
  _ControlledTextFieldProps as ControlledTextFieldProps,
  _ControlledRadioGroupProps as ControlledRadioGroupProps,
  _DateRangeProps as DateRangeProps,
  _SelectProps as SelectProps,
  _TextFieldProps as TextFieldProps
};
