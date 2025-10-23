import MultiFilter from '../MultiFilter/MultiFilter';
import { FilterCategory, FilterMap } from '../../hooks/useMultiFilters';
import { Grid, Button, ButtonProps } from '@mui/material';
import { Drawer, DrawerProps } from '../Drawer';

type FilterDrawerProps = DrawerProps & {
  filterMap: FilterMap;
  filterCategory?: FilterCategory;
  showLabelError?: boolean;
  onFilterInteraction?: () => void;
  render?: React.ReactNode;
  onSubmit?: () => void; //Callback called when the form is submitted (Enter or click on button submit) if provided, FilterDrawer is wrapped in a <form> and handles the submit
  buttons?: Array<{
    buttonText?: string;
    onButtonClick?: () => void;
    variant?: ButtonProps['variant'];
    disabled?: boolean;
    id?: string;
  }>;
};

export const FilterDrawer = ({
  filterMap,
  buttons,
  children,
  render,
  filterCategory,
  showLabelError,
  onFilterInteraction,
  onSubmit,
  ...props
}: FilterDrawerProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  //Identifies which button should be of type submit
  //By convention, the first button with variant="contained" is the submit
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

  const drawerContent = (
    <>
      {render && (
        <Grid mb={2} container>
          {render}
        </Grid>
      )}
      {children}
      <MultiFilter
        filterMap={filterMap}
        filterCategory={filterCategory}
        showLabelError={showLabelError}
        onFilterInteraction={onFilterInteraction}
      />
      <Grid container direction={'column'} marginTop={2}>
        {buttons &&
          buttons.map((btn, index) => {
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
                  onClick={
                    // If the button is type="submit", do not call onClick because the submit is handled by the form
                    !isSubmitButton ? btn.onButtonClick : undefined
                  }
                  disabled={btn.disabled}
                >
                  {btn.buttonText}
                </Button>
              </Grid>
            );
          })}
      </Grid>
    </>
  );

  return (
    <Drawer {...props}>
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
