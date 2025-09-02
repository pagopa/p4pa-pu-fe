import { Box, Button, IconButton, Stack, useTheme } from '@mui/material';
import { Add, RemoveCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Filter } from './Filter';
import { FilterCategory, FilterMap } from '../../hooks/useMultiFilters';
import { useStore } from '../../store/GlobalStore';
import {
  addFilterRow,
  removeFilterRow,
  updateFilter,
  KeyofFilterMap
} from '../../store/FilterStore';
import { FilterFieldValue } from '../../models/Filters';

export type MultiFilterProps = {
  filterMap: FilterMap;
  filterCategory?: FilterCategory;
  showLabelError?: boolean;
  onFilterInteraction?: () => void;
};

const MultiFilter = ({ filterMap, onFilterInteraction }: MultiFilterProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    state: { selectedFilters }
  } = useStore();

  const onChange = (value: FilterFieldValue, index: number) => {
    updateFilter(value as KeyofFilterMap, index);
    onFilterInteraction?.();
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
      {selectedFilters
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map((filterId, index) => (
          <Stack
            key={filterId}
            direction="row"
            gap={2}
            justifyContent="space-between"
          >
            {selectedFilters.length > 1 && (
              <IconButton
                sx={{
                  color: theme.palette.error.dark,
                  alignSelf: 'flex-start'
                }}
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
