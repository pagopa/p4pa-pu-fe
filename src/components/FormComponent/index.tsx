import { _AmountField } from './_AmountField';
import { _Button, _ButtonProps } from './_Button';
import { _DateRange, _DateRangeProps } from './_DateRange';
import { _Select, _SelectProps } from './_Select';
import { _ControlledSelect, _ControlledSelectProps } from './_SelectController';
import { _TextField, _TextFieldProps } from './_TextField';

export const FormComponent = {
  TextField: _TextField,
  AmountField: _AmountField,
  Select: _Select,
  ControlledSelect: _ControlledSelect,
  Button: _Button,
  DateRange: _DateRange
};

export type {
  _TextFieldProps as TextFieldProps,
  _SelectProps as SelectProps,
  _ControlledSelectProps as ControlledSelectProps,
  _ButtonProps as ButtonProps,
  _DateRangeProps as DateRangeProps
};
