import { Grid } from '@mui/material';
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
} & ButtonProps;

export type DateRangeField = {
  type: COMPONENT_TYPE.dateRange;
  isYear?: boolean;
  from?: {
    label?: string;
    errorMessage?: string;
    onChange?: (date: Date | null) => void;
  };
  to?: {
    label?: string;
    errorMessage?: string;
    onChange?: (date: Date | null) => void;
  };
} & Omit<DateRangeProps, 'from' | 'to' | 'onChange'>;

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
            value:
              currentValue && 'from' in currentValue
                ? currentValue?.from
                : null,
            onChange: (date: Date | null) => {
              if (dateItem?.from?.onChange) {
                dateItem?.from.onChange(date);
              }

              if (onChange) {
                const toDate =
                  currentValue && 'to' in currentValue
                    ? currentValue?.to
                    : null;

                onChange(fieldId, {
                  from: date,
                  to: toDate
                });
              }
            }
          }
        : undefined;

      const toConfig = dateItem?.to
        ? {
            ...dateItem?.to,
            value:
              currentValue && 'to' in currentValue ? currentValue.to : null,
            onChange: (date: Date | null) => {
              if (dateItem?.to?.onChange) {
                dateItem?.to.onChange(date);
              }

              if (onChange) {
                const fromDate =
                  currentValue && 'from' in currentValue
                    ? currentValue.from
                    : null;

                onChange(fieldId, {
                  from: fromDate,
                  to: date
                });
              }
            }
          }
        : undefined;

      return (
        <FormComponent.DateRange
          {...dateItem}
          from={fromConfig}
          to={toConfig}
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

const FilterContainer = ({ items, values, onChange }: FilterContainerProps) => (
  <Grid container spacing={2} data-testid="filter-container">
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
