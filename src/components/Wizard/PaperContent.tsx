import { Box, Paper, Typography } from '@mui/material';
import BookIcon from '@mui/icons-material/MenuBook';

type PaperContentProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

const PaperContent = ({
  title,
  icon = <BookIcon color="action" sx={{ mr: 1 }} />,
  children
}: PaperContentProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
      {children}
    </Paper>
  );
};

export default PaperContent;
