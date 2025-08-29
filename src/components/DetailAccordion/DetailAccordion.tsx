import { KeyboardArrowDown } from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import DetailContainer, {
  DetailSectionProps
} from '../DetailContainer/DetailContainer';

type Props = {
  idTitle?: number;
  title: string;
  description: string;
  sections: DetailSectionProps['sections'];
  defaultExpanded?: boolean;
};

export const DetailAccordion = ({
  idTitle,
  title,
  description,
  sections,
  defaultExpanded = false
}: Props) => {
  const theme = useTheme();

  return (
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      sx={{
        py: 3,
        px: 2,
        bgcolor: theme.palette.background.paper,
        borderRadius: 2
      }}
    >
      <AccordionSummary expandIcon={<KeyboardArrowDown color="primary" />}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          ml={idTitle ? 2 : 0}
        >
          <Typography variant="caption-semibold">{idTitle}</Typography>
          <Typography variant="h6">{title}</Typography>
        </Stack>
      </AccordionSummary>
      <Stack ml={3} mb={2}>
        <Typography variant="body1">{description}</Typography>
      </Stack>
      <DetailContainer
        sections={sections.map((section) => ({
          ...section,
          inline: section.inline ?? true
        }))}
        fullWidthSections
      />
    </Accordion>
  );
};

export default DetailAccordion;
