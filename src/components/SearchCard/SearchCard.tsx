import { Box, Grid, Stack, Typography } from '@mui/material';
import MultiFilter from '../MultiFilter/MultiFilter';
import FilterContainer, { FilterItem } from '../FilterContainer/FilterContainer';
import { FilterMap } from '../../hooks/useFilters';
import { ButtonProps, FormComponent } from '../FormComponent';

type SearchCardProps = {
  title: string;
  description: string;
  fields?: FilterItem[];
  button?: ButtonProps[];
  multiFilterConfig?: FilterMap;
};

const SearchCard = ({ title, description, fields, button, multiFilterConfig }: SearchCardProps) => {
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

      <Grid container alignItems="center">
        {fields && <FilterContainer items={fields} />}

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
