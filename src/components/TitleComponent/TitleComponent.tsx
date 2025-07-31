import {
  Box,
  Typography,
  TypographyOwnProps,
  Button,
  ButtonProps,
  ChipOwnProps,
  Chip,
  useTheme
} from '@mui/material';
import React from 'react';

type ActionMenuItem = {
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
  dataTestId?: string;
};

type TitleComponentProps = {
  title: string;
  variant?: TypographyOwnProps['variant'];
  description?: string;
  chip?: {
    label: string;
    color: ChipOwnProps['color'];
  };
  callToAction?: Array<ActionMenuItem | React.ReactNode>;
};

const isActionMenuItem = (
  action: ActionMenuItem | React.ReactNode
): action is ActionMenuItem => !React.isValidElement(action);

const TitleComponent = ({
  title,
  variant = 'h3',
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
          <Typography variant={variant}>{title}</Typography>

          {chip && (
            <Chip label={chip.label} color={chip.color} sx={{ ml: 2 }} />
          )}
        </Box>

        {callToAction != undefined && callToAction?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {
              // eslint-disable-next-line sonarjs/function-return-type
              callToAction.map((action, index) => {
                return isActionMenuItem(action) ? (
                  <Button
                    key={`${action.buttonText}-${index}`}
                    size="large"
                    startIcon={action.buttonText ? action.icon : undefined}
                    variant={action.variant || 'contained'}
                    color={(action.color as ButtonProps['color']) || 'primary'}
                    onClick={action.onActionClick}
                    aria-label={`${action.buttonText}`}
                    data-testid={action.dataTestId}
                    sx={
                      action.buttonText
                        ? undefined
                        : { bgcolor: theme.palette.primary.contrastText }
                    }
                  >
                    {action.buttonText ?? action.icon}
                  </Button>
                ) : (
                  action
                );
              })
            }
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
