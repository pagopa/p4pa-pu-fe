import { Box, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import MultiFilter from '../MultiFilter/MultiFilter';
import FilterContainer, {
  FilterItem
} from '../FilterContainer/FilterContainer';
import { FilterMap } from '../../hooks/useMultiFilters';
import { ButtonProps, FormComponent } from '../FormComponent';
import { useState, useEffect } from 'react';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';

export type TabsConfig = {
  label: string;
  fields: Array<FilterItem>;
};

type SearchCardProps = {
  title: string;
  description: string;
  tabsConfig?: Array<TabsConfig>;
  fields?: Array<FilterItem>;
  button?: Array<ButtonProps>;
  multiFilterConfig?: FilterMap;
  activeTabIndex?: number;
  onTabChange?: (index: number) => void;
  filterValues?: BaseFilterValues;
  onFilterChange?: (id: string, value: FilterFieldValue) => void;
  onReset?: () => void;
};

const SearchCard = ({
  title,
  description,
  tabsConfig,
  fields,
  button,
  multiFilterConfig,
  activeTabIndex = 0,
  onTabChange,
  filterValues = {},
  onFilterChange,
  onReset
}: SearchCardProps) => {
  const [localActiveTab, setLocalActiveTab] = useState<number>(activeTabIndex);

  const isControlled = onTabChange !== undefined;
  const currentTabIndex = isControlled ? activeTabIndex : localActiveTab;

  const activeFields =
    tabsConfig && tabsConfig.length > 0
      ? tabsConfig[currentTabIndex].fields
      : fields || [];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (isControlled) {
      onTabChange(newValue);
    } else {
      setLocalActiveTab(newValue);
    }
  };

  useEffect(() => {
    if (!isControlled) {
      setLocalActiveTab(activeTabIndex);
    }
  }, [activeTabIndex, isControlled]);

  useEffect(() => {
    if (onReset) {
      onReset();
    }
  }, [onReset]);

  const getButtonLenght = (length: number, index: number) => {
    if (length === 1) return 12;

    return index === 0 ? 8 : 4;
  };

  return (
    <Box
      component="section"
      width="100%"
      borderRadius={0.5}
      padding={3}
      sx={{ backgroundColor: 'background.paper' }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {description}
      </Typography>

      {tabsConfig && tabsConfig.length > 0 && (
        <Tabs
          value={currentTabIndex}
          onChange={handleTabChange}
          sx={{ maxWidth: '100%', mb: 2 }}
        >
          {tabsConfig.map((tab, index) => (
            <Tab key={index} label={tab.label} sx={{ flexGrow: 1 }} />
          ))}
        </Tabs>
      )}

      <Grid container alignItems="center">
        {activeFields.length > 0 && (
          <FilterContainer
            items={activeFields.map((field) => ({
              ...field,
              id: field.id || field.label.replace(/\s+/g, '').toLowerCase()
            }))}
            values={filterValues}
            onChange={onFilterChange}
          />
        )}

        {multiFilterConfig && (
          <Grid item lg={12}>
            <MultiFilter filterMap={multiFilterConfig} />
          </Grid>
        )}
      </Grid>

      <Stack direction="row" justifyContent="flex-end">
        <Grid container spacing={2} mt={2} sx={{ width: 'auto' }}>
          {button?.map((btn, index) => (
            <Grid item key={index} md={getButtonLenght(button.length, index)}>
              <FormComponent.Button {...btn} fullWidth />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};

export default SearchCard;
