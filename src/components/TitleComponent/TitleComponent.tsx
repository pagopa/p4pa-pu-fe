import {
  Box,
  Typography,
  TypographyOwnProps,
  Button,
  ButtonProps,
  ChipOwnProps,
  Chip,
  useTheme,
  IconButton
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
  isIconButton?: boolean;
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

  const getActionColor = (actionColor?: ActionMenuItem['color']) => {
    if (!actionColor || actionColor === 'inherit') return 'inherit';

    const colorMap = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      warning: theme.palette.warning.main
    } as const;

    return colorMap[actionColor] || theme.palette.primary.main;
  };

  const renderAction = (
    action: ActionMenuItem | React.ReactNode,
    index: number
    // eslint-disable-next-line sonarjs/function-return-type
  ) => {
    if (!isActionMenuItem(action)) {
      return action;
    }

    if (action.isIconButton) {
      return (
        <Box
          key={`icon-${index}`}
          bgcolor={theme.palette.common.white}
          borderRadius={1}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <IconButton
            size="large"
            onClick={action.onActionClick}
            data-testid={action.dataTestId}
            sx={{ color: getActionColor(action.color) }}
          >
            {action.icon}
          </IconButton>
        </Box>
      );
    }

    return (
      <Button
        key={`button-${action.buttonText}-${index}`}
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
    );
  };

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
            {callToAction.map((action, index) => renderAction(action, index))}
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
