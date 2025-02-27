import { Box, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import MultiFilter from '../MultiFilter/MultiFilter';
import FilterContainer, { FilterItem } from '../FilterContainer/FilterContainer';
import { FilterMap } from '../../hooks/useFilters';
import { ButtonProps, FormComponent } from '../FormComponent';
import { useState } from 'react';

export type TabsConfig = {
  label: string;
  fields: FilterItem[];
}

type SearchCardProps = {
  title: string;
  description: string;
  tabsConfig?: TabsConfig[];
  fields?: FilterItem[];
  button?: ButtonProps[];
  multiFilterConfig?: FilterMap;
  onTabChange?: (index: number) => void;
};

const SearchCard = ({ title, description, tabsConfig, fields, button, multiFilterConfig, onTabChange }: SearchCardProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const activeFields = tabsConfig && tabsConfig.length > 0 ? tabsConfig[activeTab].fields : fields;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  return (
    <Box
      component="section"
      width="100%"
      borderRadius={0.5}
      padding={3}
      sx={{ backgroundColor: 'background.paper' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {description}
      </Typography>

      {tabsConfig && tabsConfig.length > 0 && (
        <Tabs 
          value={activeTab}
          onChange={handleTabChange}
          sx={{ maxWidth: '100%', mb:2 }}>
          {tabsConfig.map((tab, index) => (
            <Tab key={index} label={tab.label} sx={{ flexGrow: 1}}/>
          ))}
        </Tabs>
      )}

      <Grid container alignItems="center">
        {activeFields && (
          <FilterContainer
            items={activeFields} 
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
            <Grid
              item
              key={index}
              md={button.length === 1 ? 12 : index === 0 ? 8 : 4}
            >
              <FormComponent.Button {...btn} fullWidth />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};

export default SearchCard;
