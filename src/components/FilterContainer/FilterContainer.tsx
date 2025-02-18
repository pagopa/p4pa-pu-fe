import { Grid } from '@mui/material';
import { FormComponent } from '../FormComponent';
import type { ButtonProps, DateRangeProps, SelectProps, TextFieldProps } from '../FormComponent';

export enum COMPONENT_TYPE {
  textField,
  select,
  button,
  dateRange,
  amount
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
};

type TypeUnion = SearchField | AmountField | SelectField | ButtonField | DateRangeField;

export type FilterItem = TypeUnion & {
  gridWidth?: number;
  label: string;
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

const FilterContainer = ({ items }: FilterContainerProps) =>
  items.map((item, index) => {
    const key = `${item.type}-${item.label}-${index}`;

    return (
      <Grid
        item
        xs={item.gridWidth ?? 12}
        height="100%"
        data-testid="filter-container"
        key={key}
        display="flex"
        alignItems="center">
        <RenderComponent item={item} key={key} />
      </Grid>
    );
  });

export default FilterContainer;
