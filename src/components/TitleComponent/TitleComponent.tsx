import { Box, Typography, Button, ButtonProps, useTheme } from '@mui/material';

type TitleComponentProps = {
  title: string;
  description?: string;
  callToAction?: {
    icon?: React.ReactNode;
    variant?: 'text' | 'outlined' | 'contained';
    buttonText?: string;
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    onActionClick: () => void;
  }[];
};

const TitleComponent = ({ title, description, callToAction }: TitleComponentProps) => {
  const theme = useTheme();
  
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2,
        }}
      >
        <Typography variant="h3">{title}</Typography>

        {(callToAction != undefined && callToAction?.length > 0) && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {callToAction.map((action, index) => (
              <Button
                key={`${action.buttonText}-${index}`}
                size="large"
                startIcon={action.buttonText ? action.icon : undefined}
                variant={action.variant || 'contained'}
                color={action.color as ButtonProps['color'] || 'primary'}
                onClick={action.onActionClick}
                aria-label={`${action.buttonText}`}
                sx= { action.buttonText ? undefined : { bgcolor: theme.palette.primary.contrastText } }
              >
                {action.buttonText ?? action.icon}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {description && (
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          {description}
        </Typography>
      )}
    </>
  );
};

export default TitleComponent;
