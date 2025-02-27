import { Grid } from '@mui/material';
import { FormComponent } from '../FormComponent';
import type { ButtonProps, DateRangeProps, SelectProps, TextFieldProps } from '../FormComponent';

export enum COMPONENT_TYPE {
  textField = 'textField',
  select = 'select',
  button = 'button',
  dateRange = 'dateRange',
  amount = 'amount'
}

type SearchField = {
  type: COMPONENT_TYPE.textField;
} & TextFieldProps;

type AmountField = {
  type: COMPONENT_TYPE.amount;
} & TextFieldProps;

type SelectField = {
  type: COMPONENT_TYPE.select;
} & SelectProps;

type ButtonField = {
  type: COMPONENT_TYPE.button;
  variant?: 'contained' | 'outlined';
} & ButtonProps;

type DateRangeField = DateRangeProps & {
  type: COMPONENT_TYPE.dateRange;
  isYear?: boolean;
};

type TypeUnion = SearchField | AmountField | SelectField | ButtonField | DateRangeField;

export type FilterItem = TypeUnion & {
  gridWidth?: number;
  label: string;
  required?: boolean;
};

type FilterContainerProps = {
  items: FilterItem[];
};

const RenderComponent = ({ item }: { item: FilterItem }) => {
  switch (item.type) {
  case COMPONENT_TYPE.textField:
    return <FormComponent.TextField {...item} />;

  case COMPONENT_TYPE.select:
    return <FormComponent.Select {...item} />;

  case COMPONENT_TYPE.button:
    return <FormComponent.Button {...item} />;

  case COMPONENT_TYPE.dateRange:
    return <FormComponent.DateRange {...item} />;

  case COMPONENT_TYPE.amount:
    return <FormComponent.AmountField {...item} />;

  default:
    return <FormComponent.TextField {...(item as SearchField)} />;
  }
};

const FilterContainer = ({ items }: FilterContainerProps) => (
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
          <RenderComponent item={item} />
        </Grid>
      );
    })}
  </Grid>
);

export default FilterContainer;
