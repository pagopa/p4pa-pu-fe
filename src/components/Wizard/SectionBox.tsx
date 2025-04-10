import { Box, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import BookIcon from '@mui/icons-material/MenuBook';

type SectionBoxProps = {
  title?: string;
  hideHeader?: boolean;
};

const SectionBox = ({
  title,
  children,
  hideHeader = false
}: PropsWithChildren<SectionBoxProps>) => {
  return (
    <Box sx={{ borderColor: 'divider' }} borderRadius={2} p={3} mt={3}>
      {!hideHeader && title && (
        <Box display="flex" alignItems="center" mb={2}>
          <BookIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
        </Box>
      )}
      {children}
    </Box>
  );
};

export default SectionBox;
