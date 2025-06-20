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
  setFilterValues,
  KeyofFilterMap
} from '../../store/FilterStore';
import { ChangeEvent } from 'react';
import { FormComponent } from '../FormComponent';
import { LabelEnum } from '../../../generated/apiClient';
import { ClassificationsEnum } from '../../../generated/data-contracts';

export type MultiFilterProps = {
  filterMap: FilterMap;
  filterCategory?: FilterCategory;
  showLabelError?: boolean;
  onFilterInteraction?: () => void;
};

const MultiFilter = ({
  filterMap,
  filterCategory,
  showLabelError,
  onFilterInteraction
}: MultiFilterProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    state: { selectedFilters, filterValues }
  } = useStore();

  const classificationType = filterValues.CLASSIFICATION_TYPE ?? '';

  const onClassificationChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setFilterValues({ ...filterValues, CLASSIFICATION_TYPE: newValue });

    onFilterInteraction?.();

    if (
      newValue &&
      newValue !== ClassificationsEnum.UNKNOWN &&
      selectedFilters.length === 0
    ) {
      const first = Object.keys(filterMap).find(
        (key) => key !== 'CLASSIFICATION_TYPE'
      ) as KeyofFilterMap;
      if (first) addFilterRow(first);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    updateFilter(e.target.value as KeyofFilterMap, index);
    onFilterInteraction?.();
  };

  // Add the next not already selected filter
  const addNextFilterRow = () => {
    const next: KeyofFilterMap | undefined = Object.keys(filterMap).find(
      (id) => !selectedFilters.includes(id as KeyofFilterMap)
    ) as KeyofFilterMap;
    if (next) addFilterRow(next);
  };

  const showOtherFilters =
    filterCategory != 'CLASSIFICATIONS' ||
    (classificationType && classificationType !== ClassificationsEnum.UNKNOWN);

  return (
    <Stack gap={3}>
      {filterCategory == 'CLASSIFICATIONS' && (
        <FormComponent.Select
          id="classification-type-select"
          name="CLASSIFICATION_TYPE"
          label={t('classifications.filters.classificationType')}
          options={Object.values(LabelEnum)
            .map((value) => ({
              label: t(`classificationsExport.classificationsOptions.${value}`),
              value
            }))
            .sort((a, b) => {
              // if value UNKNOWN sort before
              if (a.value === 'UNKNOWN' && b.value !== 'UNKNOWN') return -1; // a comes first
              if (a.value !== 'UNKNOWN' && b.value === 'UNKNOWN') return 1; // b comes first
              // else, sort alphabetically by label
              return a.label.localeCompare(b.label);
            })}
          error={showLabelError}
          helperText={
            showLabelError
              ? t('classifications.filters.noOptionSelected')
              : undefined
          }
          value={classificationType}
          onChange={onClassificationChange}
          sx={{ mb: 2 }}
          data-testid="classification-section-type"
        />
      )}

      {showOtherFilters &&
        selectedFilters
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

      {showOtherFilters && (
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
      )}
    </Stack>
  );
};

export default MultiFilter;
