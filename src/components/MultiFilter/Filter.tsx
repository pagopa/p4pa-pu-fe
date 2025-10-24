import { Stack } from '@mui/material';
import { useRef, useEffect } from 'react';
import { FormComponent } from '../FormComponent';
import FilterContainer from '../FilterContainer/FilterContainer';
import { FilterMap } from '../../hooks/useMultiFilters';
import { useTranslation } from 'react-i18next';
import { KeyofFilterMap } from '../../store/FilterStore';
import { FilterFieldValue } from '../../models/Filters';

export type FilterProps = {
  filterMap: FilterMap;
  onChange: (value: FilterFieldValue) => void;
  value: keyof FilterMap;
  selectedFilters: Array<KeyofFilterMap>;
};

export const Filter = ({
  filterMap,
  onChange,
  value,
  selectedFilters
}: FilterProps) => {
  const { t } = useTranslation();
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef<boolean>(true);

  // Creates the list of available options in the filter select.
  // Excludes filters already selected in other rows (except the current one).
  // Sorts alphabetically by label for a better UX.

  const sortedOptions = Object.entries(filterMap)
    .filter(
      ([key]) =>
        key === value || !selectedFilters.includes(key as KeyofFilterMap)
    )
    .map(([key, value]) => ({
      label: value.label,
      value: key
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const currentFields = filterMap[value]?.fields || [];

  // Monitor when the fields of the FilterContainer are updated. When they change (e.g. after selecting a new filter type), automatically move the focus to the first available field.
  useEffect(() => {
    // Skip the first render to avoid moving the focus when the component is mounted initially
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    // Move the focus only if there are fields to display
    if (currentFields.length > 0) {
      // Use requestAnimationFrame to wait for the browser to complete the DOM rendering
      const rafId = requestAnimationFrame(() => {
        if (!filterContainerRef.current) {
          return;
        }
        // Find all focusable elements in the FilterContainer
        const allInputs =
          filterContainerRef.current.querySelectorAll<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), [role="combobox"]:not([aria-disabled="true"])'
          );
        // Get the first focusable element available
        const firstInput = allInputs[0];
        if (firstInput) {
          firstInput.focus();
        }
      });
      return () => {
        cancelAnimationFrame(rafId);
      };
    }
    return undefined;
  }, [currentFields]);

  return (
    <Stack
      direction="column"
      gap={3}
      width="100%"
      data-testid="filter-component"
    >
      <FormComponent.Select
        id="filter-select"
        options={sortedOptions}
        label={t('commons.searchFor')}
        value={value}
        onChange={onChange}
      />

      <div ref={filterContainerRef}>
        <FilterContainer items={filterMap[value]?.fields || []} />
      </div>
    </Stack>
  );
};
