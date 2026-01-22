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
} & Omit<TextFieldProps, 'onBlur' | 'onFocus'>;

export type SelectField = {
  type: COMPONENT_TYPE.select;
  value?: string;
  onChange?: (e: string) => void;
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
  onSubmit?: () => void; //Callback called when the form is submitted (Enter or click on button submit) if provided, FilterContainer is wrapped in a <form> and handles the submit
};

const RenderComponent = ({
  item,
  values,
  onChange,
  shouldBeSubmit
}: {
  item: FilterItem;
  values?: BaseFilterValues;
  onChange?: (id: string, value: FilterFieldValue) => void;
  shouldBeSubmit?: boolean;
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

      // Check for field-specific error (e.g., fiscalCode_error)
      const fieldError = values?.[`${fieldId}_error`] as string | undefined;
      const hasError = !!fieldError;

      return (
        <FormComponent.TextField
          {...textItem}
          value={currentValue}
          error={hasError}
          helperText={fieldError}
          onChange={(e: TextFieldChangeEvent) => {
            if (hasError && onChange) {
              onChange(`${fieldId}_error`, '');
            }
            if (onChange) {
              onChange(fieldId, e.target.value);
            } else if (textItem.onChange) {
              textItem.onChange(e);
            }
          }}
          onBlur={(e: TextFieldChangeEvent) => {
            const trimmedValue = e.target.value.trim();
            if (trimmedValue !== e.target.value) {
              if (onChange) {
                onChange(fieldId, trimmedValue);
              } else if (textItem.onChange) {
                const modifiedEvent = {
                  ...e,
                  target: { ...e.target, value: trimmedValue }
                } as TextFieldChangeEvent;
                textItem.onChange(modifiedEvent);
              }
            }
          }}
        />
      );
    }

    case COMPONENT_TYPE.select: {
      const defaultValue = '';
      const currentValue =
        values && fieldId in values
          ? ((values[fieldId] as string) ?? defaultValue)
          : (item.value ?? defaultValue);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-vars
      const { value: _, ...itemWithoutValue } = item;

      return (
        <FormComponent.Select
          {...itemWithoutValue}
          value={currentValue}
          onChange={(value) => {
            if (onChange) {
              onChange(fieldId, value);
            } else if (item.onChange) {
              item.onChange(value);
            }
          }}
        />
      );
    }

    case COMPONENT_TYPE.button: {
      const buttonItem = item as ButtonField;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-vars
      const { type: _, ...buttonItemWithoutType } = buttonItem;
      const computedType = shouldBeSubmit ? 'submit' : 'button';

      return (
        <FormComponent.Button
          {...buttonItemWithoutType}
          size="small"
          type={computedType}
          onClick={(e: ButtonClickEvent) => {
            // If the button is type="submit", do not call onClick because the submit is handled by the form
            if (!shouldBeSubmit && buttonItem?.onClick) {
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

              const newValue = {
                from: toStartOfDay(date),
                to: toEndOfDay(currentValue?.to)
              };
              onChange?.(fieldId, newValue);
            }
          }
        : undefined;

      const toConfig = dateItem?.to
        ? {
            ...dateItem?.to,
            value: toEndOfDay(dateItem?.to?.value ?? currentValue?.to),
            onChange: (date: Date | null) => {
              dateItem?.to?.onChange?.(toEndOfDay(date));

              const newValue = {
                from: toStartOfDay(currentValue?.from),
                to: toEndOfDay(date)
              };
              onChange?.(fieldId, newValue);
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
  sx,
  onSubmit
}: FilterContainerProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  const gridContent = (
    <Grid container spacing={2} data-testid="filter-container" sx={sx}>
      {items.map(({ gridWidth, ...item }, index) => {
        const key = `${item.type}-${item.label}-${index}`;

        return (
          <Grid
            item
            xs={gridWidth ?? 12}
            key={key}
            sx={{ display: 'flex', alignItems: 'start', width: '100%' }}
          >
            <RenderComponent
              item={item}
              values={values}
              onChange={onChange}
              shouldBeSubmit={onSubmit && item.type === COMPONENT_TYPE.button}
            />
          </Grid>
        );
      })}
    </Grid>
  );

  return onSubmit ? (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      {gridContent}
    </form>
  ) : (
    gridContent
  );
};

export default FilterContainer;
