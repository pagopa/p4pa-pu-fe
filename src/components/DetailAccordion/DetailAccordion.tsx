import type { DetailSectionProps } from '../DetailContainer/DetailContainer';
import DetailContainer from '../DetailContainer/DetailContainer';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

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
