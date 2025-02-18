import { Box, Grid, Typography, Button } from '@mui/material';
import MultiFilter from '../MultiFilter/MultiFilter';
import FilterContainer, { FilterItem } from '../FilterContainer/FilterContainer';
import { FilterMap } from '../../hooks/useFilters';

interface ButtonField {
  text: string;
  variant?: 'contained' | 'outlined';
  onClick?: () => void;
}

type SearchCardProps = {
  title: string;
  description: string;
  fields?: FilterItem[];
  button?: ButtonField[];
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

      <Grid container spacing={2} alignItems="center">
        {fields && <FilterContainer items={fields} />}

        {multiFilterConfig && (
          <Grid item lg={12}>
            <MultiFilter filterMap={multiFilterConfig} />
          </Grid>
        )}
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
        {button?.map((btn, index) => (
          <Button key={index} variant={btn.variant} onClick={btn.onClick}>
            {btn.text}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default SearchCard;
