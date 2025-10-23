import { Box, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import MultiFilter from '../MultiFilter/MultiFilter';
import FilterContainer, {
  FilterItem
} from '../FilterContainer/FilterContainer';
import { FilterCategory, FilterMap } from '../../hooks/useMultiFilters';
import { ButtonProps, FormComponent } from '../FormComponent';
import { useState, useEffect } from 'react';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { selectedFilters } from '../../store/FilterStore';
import MultifilterInitSelect from '../MultiFilter/MultifilterInitSelect';

export type TabsConfig = {
  label: string;
  fields: Array<FilterItem>;
};

export type SearchCardProps = {
  title: string;
  description: string;
  tabsConfig?: Array<TabsConfig>;
  fields?: Array<FilterItem>;
  button?: Array<ButtonProps>;
  filterContext?: 'TELEMATIC';
  multiFilterConfig?: FilterMap;
  activeTabIndex?: number;
  onTabChange?: (index: number) => void;
  filterValues?: BaseFilterValues;
  onFilterChange?: (id: string, value: FilterFieldValue) => void;
  onReset?: () => void;
  render?: React.ReactNode;
  filterCategory?: FilterCategory;
  extraProps?: Record<string, unknown>;
  onSubmit?: () => void; //Callback called when the form is submitted (Enter or click on button submit) if provided, SearchCard is wrapped in a <form> and handles the submit
};

const SearchCard = ({
  title,
  description,
  tabsConfig,
  fields,
  button,
  render,
  filterCategory,
  extraProps,
  multiFilterConfig,
  activeTabIndex = 0,
  onTabChange,
  filterValues = {},
  onFilterChange,
  onReset,
  onSubmit
}: SearchCardProps) => {
  const [localActiveTab, setLocalActiveTab] = useState<number>(activeTabIndex);

  const isControlled = onTabChange !== undefined;
  const currentTabIndex = isControlled ? activeTabIndex : localActiveTab;

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

  const activeFields =
    tabsConfig && tabsConfig.length > 0
      ? tabsConfig[currentTabIndex].fields
      : fields || [];

  const getButtonLenght = (length: number, index: number) => {
    if (length === 1) return 12;

    return index === 0 ? 8 : 4;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  // Identify which button should be of type submit. By convention, the last button (or the one with variant="contained") is the submit
  const getButtonType = (index: number): 'submit' | 'button' => {
    if (!onSubmit) return 'button';

    // If there are buttons, the last one is the submit
    if (button && index === button.length - 1) return 'submit';

    return 'button';
  };

  const cardContent = (
    <>
      <Typography variant="h6" component={'h2'} fontWeight={700} mb={1}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {description}
      </Typography>

      {tabsConfig && tabsConfig.length > 0 && (
        <Tabs
          value={currentTabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          {tabsConfig.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      )}

      {render && (
        <Grid item lg={12} mb={2}>
          {render}
        </Grid>
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
            {selectedFilters.value.length === 0 && (
              <MultifilterInitSelect multiFilterConfig={multiFilterConfig} />
            )}

            <MultiFilter
              filterMap={multiFilterConfig}
              filterCategory={filterCategory}
              {...extraProps}
            />
          </Grid>
        )}
      </Grid>

      <Stack direction="row" justifyContent="flex-end">
        <Grid container spacing={2} mt={2} sx={{ width: 'auto' }}>
          {button?.map((btn, index) => (
            <Grid item key={index} md={getButtonLenght(button.length, index)}>
              <FormComponent.Button
                {...btn}
                fullWidth
                type={getButtonType(index)}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </>
  );

  return (
    <Box
      component="section"
      width="100%"
      borderRadius={0.5}
      padding={3}
      sx={{ backgroundColor: 'background.paper' }}
    >
      {onSubmit ? (
        <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
          {cardContent}
        </form>
      ) : (
        cardContent
      )}
    </Box>
  );
};

export default SearchCard;
