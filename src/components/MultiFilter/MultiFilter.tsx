import { Box, Button, IconButton, Stack, useTheme } from '@mui/material';
import { Add, RemoveCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Filter } from './Filter';
import { FilterMap } from '../../hooks/useMultiFilters';
import { useStore } from '../../store/GlobalStore';
import {
  addFilterRow,
  removeFilterRow,
  updateFilter,
  KeyofFilterMap
} from '../../store/FilterStore';
import { ChangeEvent } from 'react';

export type MultiFilterProps = {
  filterMap: FilterMap;
};

const MultiFilter = ({ filterMap }: MultiFilterProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    state: { selectedFilters }
  } = useStore();

  const onChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    updateFilter(e.target.value as KeyofFilterMap, index);
  };

  // Add the next not already selected filter
  const addNextFilterRow = () => {
    const next: KeyofFilterMap | undefined = Object.keys(filterMap).find(
      (id) => !selectedFilters.includes(id as KeyofFilterMap)
    ) as KeyofFilterMap;
    if (next) addFilterRow(next);
  };

  return (
    <Stack gap={3}>
      {selectedFilters.map((filterId, index) => (
        <Stack
          key={filterId}
          direction="row"
          gap={2}
          justifyContent="space-between"
        >
          {selectedFilters.length > 1 && (
            <IconButton
              sx={{ color: theme.palette.error.dark, alignSelf: 'flex-start' }}
              onClick={() => removeFilterRow(filterId)}
              aria-label="remove"
            >
              <RemoveCircleOutline fontSize="small" />
            </IconButton>
          )}
          <Filter
            value={filterId}
            filterMap={filterMap}
            selectedFilters={selectedFilters}
            onChange={(value) => onChange(value, index)}
          />
        </Stack>
      ))}

      <Box display="flex" justifyContent="flex-start">
        <Button
          variant="text"
          onClick={addNextFilterRow}
          startIcon={<Add />}
          disabled={selectedFilters.length >= Object.keys(filterMap).length}
        >
          {t('commons.addfilter')}
        </Button>
      </Box>
    </Stack>
  );
};

export default MultiFilter;
