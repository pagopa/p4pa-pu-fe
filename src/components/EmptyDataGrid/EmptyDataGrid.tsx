import { Box, Typography, Button, useTheme } from '@mui/material';
import React, { ReactNode } from 'react';

type EmptyDataGridProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
  };
  customStyles?: {
    container?: object;
    content?: object;
  };
};

const EmptyDataGrid: React.FC<EmptyDataGridProps> = ({
  title,
  action,
  customStyles = {}
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[200],
        padding: 1,
        ...customStyles.container
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          padding: 2,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          margin: 2,
          textAlign: 'center',
          ...customStyles.content
        }}
      >
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>

        {action && (
          <Button
            color="primary"
            variant={action.variant || 'text'}
            sx={{ textTransform: 'none', p: 1 }}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default EmptyDataGrid;
