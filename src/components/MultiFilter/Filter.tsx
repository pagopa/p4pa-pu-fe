import { ChangeEvent } from 'react';
import { Stack } from '@mui/material';
import { FormComponent } from '../FormComponent';
import FilterContainer from '../FilterContainer/FilterContainer';
import { FilterMap } from '../../hooks/useFilters';
import { useTranslation } from 'react-i18next';

export type FilterProps = {
  filterMap: FilterMap;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  selectedFilters: string[];
};

export const Filter = ({ filterMap, onChange, value, selectedFilters }: FilterProps) => {
  const { t } = useTranslation();

  // Sort the entries by label before mapping them to options
  const sortedOptions = Object.entries(filterMap).map(([key, value]) => ({
    label: value.label,
    value: key,
    disabled: selectedFilters.includes(key)
  }));

  return (
    <Stack direction="column" gap={3} width="100%" data-testid="filter-component">
      <FormComponent.Select
        id="filter-select"
        options={sortedOptions}
        label={t('commons.searchFor')}
        value={value}
        onChange={onChange}
      />

      <FilterContainer items={filterMap[value]?.fields || []} />
    </Stack>
  );
};
