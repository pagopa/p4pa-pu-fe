// FilterContainer.tsx
import { Grid } from '@mui/material';
import { FormComponent } from '../FormComponent';
import type { ButtonProps, DateRangeProps, SelectProps, TextFieldProps } from '../FormComponent';
import { Signal } from '@preact/signals-react';
import { ChangeEvent } from 'react';
import { BaseFilterValues, DateRangeValue } from '../../store/SearchCardStore';

export enum COMPONENT_TYPE {
  textField = 'textField',
  select = 'select',
  button = 'button',
  dateRange = 'dateRange',
  amount = 'amount'
}

export type TextFieldValue = string;
export type SelectValue = string;
export type DateRangeFieldValue = DateRangeValue;
export type AmountFieldValue = string | number;

export type TextFieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
export type SelectChangeEvent = ChangeEvent<{ value: unknown }>;

type SearchField = {
  type: COMPONENT_TYPE.textField;
  value?: TextFieldValue;
  onChange?: (e: TextFieldChangeEvent) => void;
} & TextFieldProps;

type AmountField = {
  type: COMPONENT_TYPE.amount;
  value?: AmountFieldValue;
  onChange?: (e: TextFieldChangeEvent) => void;
} & TextFieldProps;

type SelectField = {
  type: COMPONENT_TYPE.select;
  value?: SelectValue;
  onChange?: (e: SelectChangeEvent) => void;
} & SelectProps;

type ButtonField = {
  type: COMPONENT_TYPE.button;
  variant?: 'contained' | 'outlined';
  onClick?: () => void;
} & ButtonProps;

type DateRangeField = DateRangeProps & {
  type: COMPONENT_TYPE.dateRange;
  isYear?: boolean;
  value?: DateRangeFieldValue;
  onChange?: (range: DateRangeFieldValue) => void;
};

type TypeUnion = SearchField | AmountField | SelectField | ButtonField | DateRangeField;

export type FilterItem = TypeUnion & {
  gridWidth?: number;
  label: string;
  required?: boolean;
  id?: string;
};

type FilterContainerProps = {
  items: FilterItem[];
  valuesSignal?: Signal<BaseFilterValues>;
};

const RenderComponent = ({ 
  item, 
  valuesSignal 
}: { 
  item: FilterItem; 
  valuesSignal?: Signal<BaseFilterValues>;
}) => {
  const fieldId = item.id || item.label.replace(/\s+/g, '').toLowerCase();
  
  const useSignalMode = !!valuesSignal;
  
  switch (item.type) {
  case COMPONENT_TYPE.textField: {
    const textItem = item as SearchField;
    const defaultValue = '';

    let currentValue: string;

    if (useSignalMode && valuesSignal) {
      currentValue = (valuesSignal.value[fieldId] as string) ?? defaultValue;
    } else {
      currentValue = textItem.value ?? defaultValue;
    }
      
    return (
      <FormComponent.TextField 
        {...textItem} 
        value={currentValue}
        onChange={(e: TextFieldChangeEvent) => {
          if (useSignalMode && valuesSignal) {
            valuesSignal.value = {
              ...valuesSignal.value,
              [fieldId]: e.target.value
            };
          } else if (textItem.onChange) {
            textItem.onChange(e);
          }
        }}
      />
    );
  }

  case COMPONENT_TYPE.select: {
    const selectItem = item as SelectField;
    const defaultValue = '';
    
    let currentValue: string;
    
    if (useSignalMode && valuesSignal) {
      currentValue = (valuesSignal.value[fieldId] as string) ?? defaultValue;
    } else {
      currentValue = selectItem.value ?? defaultValue;
    }
    
    return (
      <FormComponent.Select 
        {...selectItem} 
        value={currentValue}
        onChange={(e: SelectChangeEvent) => {
          if (useSignalMode && valuesSignal) {
            valuesSignal.value = {
              ...valuesSignal.value,
              [fieldId]: e.target.value as string
            };
          } else if (selectItem.onChange) {
            selectItem.onChange(e);
          }
        }}
      />
    );
  }

  case COMPONENT_TYPE.button:
    return <FormComponent.Button {...(item as ButtonField)} />;

  case COMPONENT_TYPE.dateRange: {
    const dateItem = item as DateRangeField;
    const currentValue = useSignalMode 
      ? (valuesSignal?.value[fieldId] as DateRangeFieldValue) 
      : dateItem.value;
      
    return (
      <FormComponent.DateRange 
        {...dateItem} 
        value={currentValue}
        onChange={(range: DateRangeFieldValue) => {
          if (useSignalMode && valuesSignal) {
            valuesSignal.value = {
              ...valuesSignal.value,
              [fieldId]: range
            };
          } else if (dateItem.onChange) {
            dateItem.onChange(range);
          }
        }}
      />
    );
  }

  case COMPONENT_TYPE.amount: {
    const amountItem = item as AmountField;
    const currentValue = useSignalMode 
      ? (valuesSignal?.value[fieldId] as AmountFieldValue) 
      : amountItem.value || '';
      
    return (
      <FormComponent.AmountField 
        {...amountItem} 
        value={currentValue}
        onChange={(e: TextFieldChangeEvent) => {
          if (useSignalMode && valuesSignal) {
            valuesSignal.value = {
              ...valuesSignal.value,
              [fieldId]: e.target.value
            };
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

const FilterContainer = ({ items, valuesSignal }: FilterContainerProps) => (
  <Grid
    container
    spacing={2}
    data-testid="filter-container"
  >
    {items.map(({ gridWidth, ...item }, index) => {
      const key = `${item.type}-${item.label}-${index}`;

      return (
        <Grid
          item
          xs={gridWidth ?? 12}
          key={key}
          sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
        >
          <RenderComponent item={item} valuesSignal={valuesSignal} />
        </Grid>
      );
    })}
  </Grid>
);

export default FilterContainer;
