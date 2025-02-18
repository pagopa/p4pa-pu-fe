import { Box, Button, Stack } from '@mui/material';
import { Add, RemoveCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Filter } from './Filter';
import { FilterMap } from '../../hooks/useFilters';
import { useStore } from '../../store/GlobalStore';
import { addFilterRow, MAX_FILTERS, removeFilterRow } from '../../store/FilterStore';

export type MultiFilterProps = {
  filterMap: FilterMap;
};

const MultiFilter = ({ filterMap }: MultiFilterProps) => {
  const {
    state: { filters }
  } = useStore();
  const { t } = useTranslation();

  return (
    <Stack gap={3}>
      {filters.map((filterId) => (
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
          <Filter filterMap={filterMap} />
        </Stack>
      ))}

      <Box display="flex" justifyContent="flex-start">
        <Button
          variant="text"
          onClick={addFilterRow}
          startIcon={<Add />}
          disabled={filters.length >= MAX_FILTERS}>
          {t('commons.addfilter')}
        </Button>
      </Box>
    </Stack>
  );
};

export default MultiFilter;
