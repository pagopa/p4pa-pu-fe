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

type SearchField = {
  type: COMPONENT_TYPE.textField;
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  gridWidth?: number;
};

type SelectField = {
  type: COMPONENT_TYPE.select;
  options?: { label: string; value: string }[];
};

type DateRangeField = DateRangeProps & {
  type: COMPONENT_TYPE.dateRange;
};

type ButtonField = {
  type: COMPONENT_TYPE.button;
  variant?: 'contained' | 'outlined';
  onClick: () => void;
};

type TypeUnion = SearchField | SelectField | ButtonField | DateRangeField;

export type FilterItem = TypeUnion & {
  gridWidth?: number;
  label: string;
};

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
      />
    );

  case COMPONENT_TYPE.select:
    return (
      <TextField fullWidth size="small" data-testid={id} label={item.label} select value=''>
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
        variant="contained"
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
