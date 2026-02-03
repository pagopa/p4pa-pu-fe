import { Button, ButtonProps, Grid } from '@mui/material';
import { Drawer, DrawerProps } from '../Drawer';
import FilterContainer, {
  FilterItem,
  COMPONENT_TYPE
} from '../FilterContainer/FilterContainer';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

type FilterContainerDrawerButton = {
  buttonText: string;
  onClick?: () => void;
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  id?: string;
};

type FilterContainerDrawerProps = Omit<DrawerProps, 'children'> & {
  items: Array<FilterItem>;
  values?: BaseFilterValues;
  onChange?: (id: string, value: FilterFieldValue) => void;
  onSubmit?: () => void;
  buttons?: Array<FilterContainerDrawerButton>;
  showError?: boolean;
};

export const FilterContainerDrawer = ({
  items,
  values,
  onChange,
  onSubmit,
  buttons,
  showError,
  titleVariant,
  ...drawerProps
}: FilterContainerDrawerProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  const getButtonType = (
    index: number,
    variant?: ButtonProps['variant']
  ): 'submit' | 'button' => {
    if (!onSubmit) return 'button';
    const firstContainedIndex = buttons?.findIndex(
      (btn) => btn.variant === 'contained'
    );
    if (variant === 'contained' && index === firstContainedIndex)
      return 'submit';
    return 'button';
  };

  const verticalItems = items
    .filter((item) => item.type !== COMPONENT_TYPE.button)
    .map((item) => ({
      ...item,
      gridWidth: 12
    }));

  const drawerContent = (
    <>
      {showError && (
        <Grid mb={2}>
          <ErrorMessage variant="outlined" />
        </Grid>
      )}
      <FilterContainer
        items={verticalItems}
        values={values}
        onChange={onChange}
      />
      {buttons && buttons.length > 0 && (
        <Grid container direction="column" marginTop={2}>
          {buttons.map((btn, index) => {
            const buttonType = getButtonType(index, btn.variant);
            const isSubmitButton = buttonType === 'submit';

            return (
              <Grid item mb={1} key={`${btn.buttonText}-${index}`}>
                <Button
                  id={btn.id}
                  fullWidth
                  size="medium"
                  variant={btn.variant}
                  type={buttonType}
                  onClick={!isSubmitButton ? btn.onClick : undefined}
                  disabled={btn.disabled}
                >
                  {btn.buttonText}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );

  return (
    <Drawer {...drawerProps} titleVariant={titleVariant}>
      {onSubmit ? (
        <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
          {drawerContent}
        </form>
      ) : (
        drawerContent
      )}
    </Drawer>
  );
};

export default FilterContainerDrawer;
