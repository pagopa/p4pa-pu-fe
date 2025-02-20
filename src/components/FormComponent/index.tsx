import { _AmountField } from './_AmountField';
import { _Button, _ButtonProps } from './_Button';
import { _DateRange, _DateRangeProps } from './_DateRange';
import { _Select, _SelectProps } from './_Select';
import { _TextField, _TextFieldProps } from './_TextField';

export const FormComponent = {
  TextField: _TextField,
  AmountField: _AmountField,
  Select: _Select,
  Button: _Button,
  DateRange: _DateRange
};

export type {
  _TextFieldProps as TextFieldProps,
  _SelectProps as SelectProps,
  _ButtonProps as ButtonProps,
  _DateRangeProps as DateRangeProps
};
