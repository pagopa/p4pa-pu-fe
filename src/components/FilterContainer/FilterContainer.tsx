import React from 'react';
import {
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  TextField
} from '@mui/material';
import { DateRange, DateRangeProps } from '../DateRange';

export enum COMPONENT_TYPE {
  textField,
  select,
  button,
  dateRange
}

type BaseField = {
  gridWidth?: number;
  label: string;
};

type SearchField = BaseField & {
  type: COMPONENT_TYPE.textField;
  placeholder?: string;
  icon?: React.ReactNode;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

type SelectField = BaseField & {
  type: COMPONENT_TYPE.select;
  options?: { label: string; value: string }[];
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

type DateRangeField = BaseField & DateRangeProps & {
  type: COMPONENT_TYPE.dateRange;
};

type ButtonField = BaseField & {
  type: COMPONENT_TYPE.button;
  variant?: 'contained' | 'outlined';
  onClick: () => void;
};

export type FilterItem = SearchField | SelectField | ButtonField | DateRangeField;

type FilterContainerProps = {
  items: FilterItem[];
};

const RenderComponent = ({ item, id }: { item: FilterItem; id: string }) => {
  switch (item.type) {
  case COMPONENT_TYPE.textField:
    return (
      <TextField
        data-testid={id}
        fullWidth
        InputProps={{
          endAdornment: item.icon ? (
            <InputAdornment position="end">{item.icon}</InputAdornment>
          ) : undefined
        }}
        label={item.label}
        size="small"
        placeholder={item.placeholder || ''}
        onChange={item.onChange}
      />
    );

  case COMPONENT_TYPE.select:
    return (
      <TextField 
        fullWidth 
        size="small" 
        data-testid={id} 
        label={item.label} 
        select 
        value={item.value || ''}
        onChange={item.onChange}
      >
        {item.options?.map((option, optionIndex) => (
          <MenuItem key={`${item.label}-${option.value}-${optionIndex}`} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );

  case COMPONENT_TYPE.button:
    return (
      <Button
        fullWidth
        size="medium"
        variant={item.variant || 'contained'}
        sx={{ height: 40 }}
        onClick={item.onClick}>
        {item.label}
      </Button>
    );

  case COMPONENT_TYPE.dateRange:
    return <DateRange {...item} />;
  }
};

const FilterContainer = ({ items }: FilterContainerProps) =>
  items.map((item, index) => {
    const key = `${item.type}-${item.label}-${index}`;

    return (
      <Grid
        item
        xs={item.gridWidth ?? 12}
        height="100%"
        key={index}
        display="flex"
        alignItems="center">
        <RenderComponent item={item} id={key} />
      </Grid>
    );
  });

export default FilterContainer;
