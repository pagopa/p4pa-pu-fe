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
import { FilterMap } from '../../hooks/useFilters';

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
  multiFilterConfig?: FilterMap;
  buttons?: {
    buttonText?: string;
    onButtonClick?: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    disabled?: boolean
  }[];
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  open,
  onClose,
  fields,
  title,
  buttons,
  multiFilterConfig
}) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted
      disableScrollLock
      PaperProps={{
        sx: {
          width: 500,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          scrollbarWidth: 'none',
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
      {multiFilterConfig && (
        <MultiFilter filterMap={multiFilterConfig}/>
      )}
      <Grid container direction={'column'} marginTop={2}>
        {buttons && buttons.map((btn, index) => (
          <Grid item mb={1} key={`${btn.buttonText}-${index}`}>
            <Button
              fullWidth
              size='large'
              variant={btn.variant}
              onClick={btn.onButtonClick}
              disabled={btn.disabled}
            >
              {btn.buttonText}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Drawer>
  );
};

export default CustomDrawer;
