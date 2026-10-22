import { _AmountField } from './_AmountField';
import type { _ButtonProps } from './_Button';
import { _Button } from './_Button';
import type { _ControlledTextFieldProps } from './_ControlledTextField';
import { _ControlledTextField } from './_ControlledTextField';
import type { _DateRangeProps } from './_DateRange';
import { _DateRange } from './_DateRange';
import type { _SelectProps } from './_Select';
import { _Select } from './_Select';
import type { _ControlledSelectProps } from './_ControlledSelect';
import { _ControlledSelect } from './_ControlledSelect';
import type { _TextFieldProps } from './_TextField';
import { _TextField } from './_TextField';
import type { _ControlledRadioGroupProps } from './_ControlledRadioGroup';
import { _ControlledRadioGroup } from './_ControlledRadioGroup';
import type { _ControlledSwitchProps } from './_ControlledSwitch';
import { _ControlledSwitch } from './_ControlledSwitch';
import type { _ControlledCheckboxProps } from './_ControlledCheckbox';
import { _ControlledCheckbox } from './_ControlledCheckbox';
import type { _ControlledFileUploaderProps } from './_ControlledFileUploader';
import { _ControlledFileUploader } from './_ControlledFileUploader';
import type { _ControlledDateRangeProps } from './_ControlledDateRange';
import { _ControlledDateRange } from './_ControlledDateRange';
import type { _ControlledAmountFieldProps } from './_ControlledAmountField';
import { _ControlledAmountField } from './_ControlledAmountField';
import { _RadioLabel } from './_RadioLabel';

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
  ControlledAmountField: _ControlledAmountField,
  DateRange: _DateRange,
  Select: _Select,
  TextField: _TextField,
  RadioLabel: _RadioLabel
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
  _ControlledAmountFieldProps as ControlledAmountFieldProps,
  _DateRangeProps as DateRangeProps,
  _SelectProps as SelectProps,
  _TextFieldProps as TextFieldProps
};
