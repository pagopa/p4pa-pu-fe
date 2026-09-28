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
  description,
  icon,
  action,
  customStyles = {}
}) => {
  const theme = useTheme();
  // icon/description switch to the stacked (full empty state) layout
  const stacked = Boolean(icon || description);

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
          flexDirection: stacked ? 'column' : 'row',
          gap: stacked ? 1 : 0,
          py: stacked ? 3 : 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          margin: 2,
          textAlign: 'center',
          ...customStyles.content
        }}
      >
        {icon}
        <Typography
          variant="body2"
          fontWeight={stacked ? 600 : undefined}
          color="textSecondary"
        >
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        )}

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
