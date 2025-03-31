import {
  Box,
  Typography,
  Button,
  ButtonProps,
  ChipOwnProps,
  Chip,
  useTheme
} from '@mui/material';

type TitleComponentProps = {
  isSubtitle?: boolean;
  title: string;
  description?: string;
  chip?: {
    label: string;
    color: ChipOwnProps['color'];
  };
  callToAction?: Array<{
    icon?: React.ReactNode;
    variant?: 'text' | 'outlined' | 'contained';
    buttonText?: string;
    color?:
      | 'inherit'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'error'
      | 'info'
      | 'warning';
    onActionClick: () => void;
  }>;
};

const TitleComponent = ({
  isSubtitle,
  title,
  description,
  chip,
  callToAction
}: TitleComponentProps) => {
  const theme = useTheme();
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2
        }}
      >
        <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
          <Typography variant={isSubtitle ? 'h6' : 'h3'}>{title}</Typography>

          {chip && (
            <Chip label={chip.label} color={chip.color} sx={{ ml: 2 }} />
          )}
        </Box>

        {callToAction != undefined && callToAction?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {callToAction.map((action, index) => (
              <Button
                key={`${action.buttonText}-${index}`}
                size="large"
                startIcon={action.buttonText ? action.icon : undefined}
                variant={action.variant || 'contained'}
                color={(action.color as ButtonProps['color']) || 'primary'}
                onClick={action.onActionClick}
                aria-label={`${action.buttonText}`}
                sx={
                  action.buttonText
                    ? undefined
                    : { bgcolor: theme.palette.primary.contrastText }
                }
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
