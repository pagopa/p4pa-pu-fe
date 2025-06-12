import MultiFilter from '../MultiFilter/MultiFilter';
import { FilterMap } from '../../hooks/useMultiFilters';
import { Grid, Button } from '@mui/material';
import { Drawer, DrawerProps } from '../Drawer';

type FilterDrawerProps = DrawerProps & {
  filterMap: FilterMap;
  render?: React.ReactNode;
  buttons?: Array<{
    buttonText?: string;
    onButtonClick?: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    disabled?: boolean;
  }>;
};

export const FilterDrawer = ({
  filterMap,
  buttons,
  children,
  render,
  ...props
}: FilterDrawerProps) => (
  <Drawer {...props}>
    {children}
    <MultiFilter filterMap={filterMap} />
    {render && <Grid container>{render}</Grid>}
    <Grid container direction={'column'} marginTop={2}>
      {buttons &&
        buttons.map((btn, index) => (
          <Grid item mb={1} key={`${btn.buttonText}-${index}`}>
            <Button
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
