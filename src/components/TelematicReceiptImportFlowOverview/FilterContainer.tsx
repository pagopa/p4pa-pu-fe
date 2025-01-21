import React from 'react';
import { Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, useTheme } from '@mui/material';
import { COMPONENT_TYPE } from '../../store/types';



type FilterItem = {
  type: COMPONENT_TYPE;
  label: string;
  gridWidth: number;
  icon?: React.ReactNode;
  options?: { label: string; value: string }[];
  onClick?: () => void;
};

type FilterContainerProps = {
  items: FilterItem[];
};

const FilterContainer = ({ items }: FilterContainerProps) => {
  const theme = useTheme();

  return (
    <>
      {items.map((item, index) => {
        const key = `${item.type}-${item.label}-${index}`;

        if (item.type === COMPONENT_TYPE.textField) {
          return (
            <Grid item lg={item.gridWidth} key={key}>
              <TextField
                sx={{ bgcolor: theme.palette.common.white }}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: item.icon ? (
                    <InputAdornment position="end">{item.icon}</InputAdornment>
                  ) : undefined,
                }}
                label={item.label}
              />
            </Grid>
          );
        }

        if (item.type === COMPONENT_TYPE.select) {
          return (
            <Grid item lg={item.gridWidth} key={key}>
              <FormControl fullWidth size="small">
                <InputLabel>{item.label}</InputLabel>
                <Select
                  sx={{ bgcolor: theme.palette.common.white }}
                  label={item.label}
                  onChange={function noRefCheck() {}}
                  value=""
                >
                  {item.options?.map((option, optionIndex) => (
                    <MenuItem key={`${item.label}-${option.value}-${optionIndex}`} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          );
        }

        if (item.type === COMPONENT_TYPE.button) {
          return (
            <Grid item lg={item.gridWidth} key={key}>
              <Button
                fullWidth
                size="medium"
                variant="contained"
                sx={{ height: 40 }}
                onClick={item.onClick}
              >
                {item.label}
              </Button>
            </Grid>
          );
        }
      })}
    </>
  );
};

export default FilterContainer;
