import { Box, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import BookIcon from '@mui/icons-material/MenuBook';

type Props = {
  title: string;
};

const SectionBox = ({ title, children }: PropsWithChildren<Props>) => {
  return (
    <Box sx={{ borderColor: 'divider' }} borderRadius="8px" p={3} mt={3}>
      <Box display="flex" alignItems="center" mb={2}>
        <BookIcon color="action" sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
};

export default SectionBox;
