import { Grid, GridOwnProps } from '@mui/material';
import { FormComponent } from '../FormComponent';
import type {
  ButtonProps,
  DateRangeProps,
  SelectProps,
  TextFieldProps
} from '../FormComponent';
import { ChangeEvent, MouseEvent } from 'react';
import {
  DateRangeValue,
  BaseFilterValues,
  FilterFieldValue
} from '../../models/Filters';
import { toEndOfDay, toStartOfDay } from '../../utils/formatters';

export enum COMPONENT_TYPE {
  textField = 'textField',
  select = 'select',
  button = 'button',
  dateRange = 'dateRange',
  amount = 'amount'
}

export type DateRangeFieldValue = DateRangeValue;
export type AmountFieldValue = string | number;

export type TextFieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;
export type SelectChangeEvent = ChangeEvent<{ value: unknown }>;
export type ButtonClickEvent = MouseEvent<
  HTMLButtonElement,
  globalThis.MouseEvent
>;

export type SearchField = {
  type: COMPONENT_TYPE.textField;
  value?: string;
} & TextFieldProps;

export type AmountField = {
  type: COMPONENT_TYPE.amount;
} & TextFieldProps;

export type SelectField = {
  type: COMPONENT_TYPE.select;
  value?: string;
  onChange?: (e: SelectChangeEvent) => void;
} & SelectProps;

export type ButtonField = {
  type: COMPONENT_TYPE.button;
  onClick?: (e: ButtonClickEvent) => void;
} & Omit<ButtonProps, 'type'>;

export type DateRangeField = {
  type: COMPONENT_TYPE.dateRange;
  isYear?: boolean;
} & DateRangeProps;

type TypeUnion =
  | SearchField
  | AmountField
  | SelectField
  | ButtonField
  | DateRangeField;

export type FilterItem = TypeUnion & {
  gridWidth?: number;
  label: string;
  required?: boolean;
  id?: string;
};

type FilterContainerProps = {
  items: Array<FilterItem>;
  values?: BaseFilterValues;
  onChange?: (id: string, value: FilterFieldValue) => void;
  sx?: GridOwnProps['sx'];
};

const RenderComponent = ({
  item,
  values,
  onChange
}: {
  item: FilterItem;
  values?: BaseFilterValues;
  onChange?: (id: string, value: FilterFieldValue) => void;
}) => {
  const fieldId = item.id || item.label.replace(/\s+/g, '').toLowerCase();

  switch (item.type) {
    case COMPONENT_TYPE.textField: {
      const textItem = item as SearchField;
      const defaultValue = '';
      const currentValue =
        values && fieldId in values
          ? ((values[fieldId] as string) ?? defaultValue)
          : (textItem.value ?? defaultValue);

      return (
        <FormComponent.TextField
          {...textItem}
          value={currentValue}
          onChange={(e: TextFieldChangeEvent) => {
            if (onChange) {
              onChange(fieldId, e.target.value);
            } else if (textItem.onChange) {
              textItem.onChange(e);
            }
          }}
        />
      );
    }

    case COMPONENT_TYPE.select: {
      const selectItem = item as SelectField;
      const defaultValue = selectItem.defaultValue || '';
      const currentValue =
        values && fieldId in values
          ? ((values[fieldId] as string) ?? defaultValue)
          : (selectItem.value ?? defaultValue);

      return (
        <FormComponent.Select
          {...selectItem}
          value={currentValue}
          onChange={(e: SelectChangeEvent) => {
            if (onChange) {
              onChange(fieldId, e.target.value as string);
            } else if (selectItem.onChange) {
              selectItem.onChange(e);
            }
          }}
        />
      );
    }

    case COMPONENT_TYPE.button: {
      const buttonItem = item as ButtonField;

      return (
        <FormComponent.Button
          {...buttonItem}
          onClick={(e: ButtonClickEvent) => {
            if (buttonItem?.onClick) {
              buttonItem.onClick(e);
            }
          }}
        />
      );
    }

    case COMPONENT_TYPE.dateRange: {
      const dateItem = item as DateRangeField;
      const currentValue =
        values && fieldId in values
          ? (values[fieldId] as DateRangeFieldValue)
          : undefined;

      const fromConfig = dateItem?.from
        ? {
            ...dateItem?.from,
            value: toStartOfDay(dateItem?.from?.value ?? currentValue?.from),
            onChange: (date: Date | null) => {
              dateItem?.from?.onChange?.(toStartOfDay(date));

              onChange?.(fieldId, {
                from: toStartOfDay(date),
                to: toEndOfDay(currentValue?.to)
              });
            }
          }
        : undefined;

      const toConfig = dateItem?.to
        ? {
            ...dateItem?.to,
            value: toEndOfDay(dateItem?.to?.value ?? currentValue?.to),
            onChange: (date: Date | null) => {
              dateItem?.to?.onChange?.(toEndOfDay(date));

              onChange?.(fieldId, {
                from: toStartOfDay(currentValue?.from),
                to: toEndOfDay(date)
              });
            }
          }
        : undefined;

      return (
        <FormComponent.DateRange
          {...dateItem}
          from={fromConfig}
          to={toConfig}
          onFromErrorChange={(err) => {
            if (onChange) onChange(`${fieldId}_fromError`, err);
          }}
          onToErrorChange={(err) => {
            if (onChange) onChange(`${fieldId}_toError`, err);
          }}
        />
      );
    }

    case COMPONENT_TYPE.amount: {
      const amountItem = item as AmountField;
      const defaultValue = '';
      const currentValue =
        values && fieldId in values
          ? ((values[fieldId] as AmountFieldValue) ?? defaultValue)
          : (amountItem.value ?? defaultValue);

      return (
        <FormComponent.AmountField
          {...amountItem}
          value={currentValue}
          onChange={(e: TextFieldChangeEvent) => {
            if (onChange) {
              onChange(fieldId, e.target.value);
            } else if (amountItem.onChange) {
              amountItem.onChange(e);
            }
          }}
        />
      );
    }

    default:
      return null;
  }
};

const FilterContainer = ({
  items,
  values,
  onChange,
  sx
}: FilterContainerProps) => (
  <Grid container spacing={2} data-testid="filter-container" sx={sx}>
    {items.map(({ gridWidth, ...item }, index) => {
      const key = `${item.type}-${item.label}-${index}`;

      return (
        <Grid
          item
          xs={gridWidth ?? 12}
          key={key}
          sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
        >
          <RenderComponent item={item} values={values} onChange={onChange} />
        </Grid>
      );
    })}
  </Grid>
);

export default FilterContainer;
