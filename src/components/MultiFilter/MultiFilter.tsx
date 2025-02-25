import { Box, Button, IconButton, Stack, useTheme } from '@mui/material';
import { Add, RemoveCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Filter } from './Filter';
import { FilterMap } from '../../hooks/useFilters';
import { useStore } from '../../store/GlobalStore';
import {
  addFilterRow,
  removeAllFilters,
  removeFilterRow,
  updateFilter
} from '../../store/FilterStore';
import { ChangeEvent, useEffect } from 'react';

export type MultiFilterProps = {
  filterMap: FilterMap;
};

const MultiFilter = ({ filterMap }: MultiFilterProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  const {
    state: { filters }
  } = useStore();

  useEffect(() => {
    removeAllFilters();
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    updateFilter(e.target.value, index);
  };

  // Add the next not already selected filter
  const addNextFilterRow = () =>
    addFilterRow(Object.keys(filterMap).find((id) => !filters.includes(id)));

  return (
    <Stack gap={3}>
      {filters.map((filterId, index) => (
        <Stack key={filterId} direction="row" gap={2} justifyContent="space-between">
          {filters.length > 1 && (
            <IconButton
              sx={{color: theme.palette.error.dark, alignSelf: 'flex-start'}}
              onClick={() => removeFilterRow(filterId)}
              aria-label="remove">
              <RemoveCircleOutline fontSize="small" />
            </IconButton>
          )}
          <Filter
            value={filterId}
            filterMap={filterMap}
            selectedFilters={filters}
            onChange={(value) => onChange(value, index)}
          />
        </Stack>
      ))}

      <Box display="flex" justifyContent="flex-start">
        <Button
          variant="text"
          onClick={addNextFilterRow}
          startIcon={<Add />}
          disabled={filters.length >= Object.keys(filterMap).length}>
          {t('commons.addfilter')}
        </Button>
      </Box>
    </Stack>
  );
};

export default MultiFilter;
