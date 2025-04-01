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
};

export const DetailAccordion = ({
  idTitle,
  title,
  description,
  sections
}: Props) => {
  const theme = useTheme();

  return (
    <Accordion
      disableGutters
      sx={{ py: 3, bgcolor: theme.palette.background.paper, borderRadius: 2 }}
    >
      <AccordionSummary expandIcon={<KeyboardArrowDown color="primary" />}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption-semibold">{idTitle}</Typography>
          <Typography variant="h6">{title}</Typography>
        </Stack>
      </AccordionSummary>
      <Stack ml={2} mb={2}>
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
