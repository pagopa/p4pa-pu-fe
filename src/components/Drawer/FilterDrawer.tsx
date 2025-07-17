import MultiFilter from '../MultiFilter/MultiFilter';
import { FilterCategory, FilterMap } from '../../hooks/useMultiFilters';
import { Grid, Button } from '@mui/material';
import { Drawer, DrawerProps } from '../Drawer';

type FilterDrawerProps = DrawerProps & {
  filterMap: FilterMap;
  filterCategory?: FilterCategory;
  showLabelError?: boolean;
  onFilterInteraction?: () => void;
  render?: React.ReactNode;
  buttons?: Array<{
    buttonText?: string;
    onButtonClick?: () => void;
    variant?: 'contained' | 'outlined' | 'text';
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
  ...props
}: FilterDrawerProps) => (
  <Drawer {...props}>
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
        buttons.map((btn, index) => (
          <Grid item mb={1} key={`${btn.buttonText}-${index}`}>
            <Button
              id={btn.id}
              fullWidth
              size="large"
              variant={btn.variant}
              onClick={btn.onButtonClick}
              disabled={btn.disabled}
            >
              {btn.buttonText}
            </Button>
          </Grid>
        ))}
    </Grid>
  </Drawer>
);
