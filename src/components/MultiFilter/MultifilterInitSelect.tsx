import { useTranslation } from 'react-i18next';
import type { KeyofFilterMap } from '../../store/FilterStore';
import { addFilterRow } from '../../store/FilterStore';
import type { FilterMap } from '../../hooks/useMultiFilters';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

type MultifilterInitSelectProps = {
  multiFilterConfig: FilterMap;
};

const MultifilterInitSelect = ({
  multiFilterConfig
}: MultifilterInitSelectProps) => {
  const { t } = useTranslation();

  const handleChange = (event: { target: { value: string } }) => {
    const value = event.target.value;
    // Add the selected filter - the component will disappear automatically
    // when selectedFilters.value.length > 0 in SearchCard
    if (value) {
      addFilterRow(value as KeyofFilterMap);
    }
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel
        id="multifilters-init-choose-label"
        sx={{ bgcolor: '#fff', px: 1 }}
      >
        {t('commons.searchFor')}
      </InputLabel>
      <Select
        labelId="multifilters-init-choose-label"
        data-testid="multifilters-init-choose-select"
        id="multifilters-init-choose-select"
        value=""
        onChange={handleChange}
      >
        {Object.entries(multiFilterConfig).map(([key, obj]) => (
          <MenuItem key={key} value={key} data-testid={key}>
            {obj.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultifilterInitSelect;
