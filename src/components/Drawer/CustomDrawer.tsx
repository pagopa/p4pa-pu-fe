import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  IconButton,
  useTheme,
  Grid,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import MultiFilter from '../MultiFilter/MultiFilter';

interface MultiFilterConfig {
  enabled: boolean;
  selectLabel: string;
  inputLabel: {
    label: string;
    icon?: React.ReactNode;
  };
  selectOptions: { label: string; value: string }[];
}

interface CustomDrawerProps {
  open: boolean;
  onClose: () => void;
  fields?: {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    variant?: 'body1' | 'body2' | 'h6' | 'subtitle1' | 'monospaced';
  }[];
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
  startIcon?: React.ReactNode;
  multiFilterConfig?: MultiFilterConfig;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  open,
  onClose,
  fields,
  title,
  buttonText,
  onButtonClick,
  startIcon,
  multiFilterConfig
}) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          padding: theme.spacing(3),
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <IconButton onClick={onClose} data-testid='close-icon'>
          <Close />
        </IconButton>
      </Box>
      <List >
        {fields?.map((field) => (
          <ListItem key={field.id} disableGutters disablePadding>
            <ListItemText
              primary={
                <Typography variant="body2" color="textSecondary" fontWeight={400} >
                  {field.label}
                </Typography>
              }
              secondary={
                <Typography variant={field.variant || 'body1'} fontWeight={field.variant ?? 600} 
                  paragraph={true} sx={{wordBreak: 'break-word'}}>
                  {field.value}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      {multiFilterConfig?.enabled && (
        <Grid item lg={12}>
          <MultiFilter
            selectLabel={multiFilterConfig.selectLabel}
            inputLabel={multiFilterConfig.inputLabel}
            selectOptions={multiFilterConfig.selectOptions}
          />
        </Grid>
      )}
      {buttonText && onButtonClick && (
        <Box mt={2}>
          <Button
            fullWidth
            size='large'
            variant="contained"
            onClick={onButtonClick}
            startIcon={startIcon}
          >
            {buttonText}
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CustomDrawer;
