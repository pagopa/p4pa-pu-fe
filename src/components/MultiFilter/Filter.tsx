import { ChangeEvent, useState } from 'react';
import { Stack } from '@mui/material';
import { FormComponent } from '../FormComponent';
import FilterContainer from '../FilterContainer/FilterContainer';
import { FilterMap } from '../../hooks/useFilters';
import { useTranslation } from 'react-i18next';

export type FilterProps = {
  filterMap: FilterMap;
};

export const Filter = ({ filterMap }: FilterProps) => {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<keyof FilterMap>(Object.keys(filterMap)[0]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(e.target.value);
  };

  // Sort the entries by label before mapping them to options
  const sortedOptions = Object.entries(filterMap)
    .sort(([, a], [, b]) => a.label.localeCompare(b.label))
    .map(([key, value]) => ({
      label: value.label,
      value: key
    }));

  return (
    <Stack direction="row" gap={3} width="100%" data-testid="filter-component">
      <FormComponent.Select
        id="filter-select"
        options={sortedOptions}
        label={t('commons.searchFor')}
        value={selectedValue}
        onChange={onChange}
      />

      <FilterContainer items={filterMap[selectedValue]?.fields || []} />
    </Stack>
  );
};
