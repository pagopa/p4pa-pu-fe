import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from './Filter';
import { HiddenDiv } from '../HiddenDiv';
import type { FilterCategory, FilterMap } from '../../hooks/useMultiFilters';
import { useStore } from '../../store/GlobalStore';
import type { KeyofFilterMap } from '../../store/FilterStore';
import {
  addFilterRow,
  removeFilterRow,
  updateFilter
} from '../../store/FilterStore';
import type { FilterFieldValue } from '../../models/Filters';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Add from '@mui/icons-material/Add';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';

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

  // Announcement for screen readers after a filter row is removed.
  // `count` is used as React key so that removing the same filter twice in a
  // row still updates the live region and gets announced again.
  const [removed, setRemoved] = useState({ label: '', count: 0 });

  const onRemove = (filterId: KeyofFilterMap) => {
    const label = filterMap[filterId]?.label ?? '';
    removeFilterRow(filterId);
    setRemoved((prev) => ({ label, count: prev.count + 1 }));
  };

  const onChange = (value: FilterFieldValue, index: number) => {
    updateFilter(value as KeyofFilterMap | undefined, index);
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
      {selectedFilters.map((filterId, index) => (
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
              onClick={() => onRemove(filterId)}
              aria-label={t('a11y.filters.removeFilter', {
                filter: filterMap[filterId]?.label ?? ''
              })}
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
          sx={{ px: 0 }}
        >
          {t('commons.addfilter')}
        </Button>
      </Box>

      {removed.label && (
        <HiddenDiv
          key={removed.count}
          message={t('a11y.filters.filterRemoved', { filter: removed.label })}
        />
      )}
    </Stack>
  );
};

export default MultiFilter;
