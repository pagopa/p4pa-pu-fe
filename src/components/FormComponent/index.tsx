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
import { _ControlledSwitch, _ControlledSwitchProps } from './_ControlledSwitch';
import {
  _ControlledCheckbox,
  _ControlledCheckboxProps
} from './_ControlledCheckbox';
import {
  _ControlledFileUploader,
  _ControlledFileUploaderProps
} from './_ControlledFileUploader';
import {
  _ControlledDateRange,
  _ControlledDateRangeProps
} from './_ControlledDateRange';

export const FormComponent = {
  AmountField: _AmountField,
  Button: _Button,
  ControlledCheckbox: _ControlledCheckbox,
  ControlledRadioGroup: _ControlledRadioGroup,
  ControlledSelect: _ControlledSelect,
  ControlledSwitch: _ControlledSwitch,
  ControlledTextField: _ControlledTextField,
  ControlledFileUploader: _ControlledFileUploader,
  ControlledDateRange: _ControlledDateRange,
  DateRange: _DateRange,
  Select: _Select,
  TextField: _TextField
};

export type {
  _ButtonProps as ButtonProps,
  _ControlledCheckboxProps as ControlledCheckboxProps,
  _ControlledRadioGroupProps as ControlledRadioGroupProps,
  _ControlledSelectProps as ControlledSelectProps,
  _ControlledSwitchProps as ControlledSwitchProps,
  _ControlledTextFieldProps as ControlledTextFieldProps,
  _ControlledFileUploaderProps as ControlledFileUploaderProps,
  _ControlledDateRangeProps as ControlledDateRangeProps,
  _DateRangeProps as DateRangeProps,
  _SelectProps as SelectProps,
  _TextFieldProps as TextFieldProps
};
