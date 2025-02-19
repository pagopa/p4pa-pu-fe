import { Box, Button, Stack } from '@mui/material';
import { Add, RemoveCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Filter } from './Filter';
import { FilterMap } from '../../hooks/useFilters';
import { useStore } from '../../store/GlobalStore';
import { addFilterRow, removeFilterRow, updateFilter } from '../../store/FilterStore';
import { ChangeEvent } from 'react';

export type MultiFilterProps = {
  filterMap: FilterMap;
};

const MultiFilter = ({ filterMap }: MultiFilterProps) => {
  const {
    state: { filters }
  } = useStore();
  const { t } = useTranslation();

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
            <Button
              onClick={() => removeFilterRow(filterId)}
              variant="text"
              color="error"
              aria-label="remove">
              <RemoveCircleOutline fontSize="small" />
            </Button>
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
