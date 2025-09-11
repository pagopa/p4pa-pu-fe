import {
  Box,
  Typography,
  TypographyOwnProps,
  Button,
  ButtonProps,
  ChipOwnProps,
  Chip,
  useTheme,
  IconButton,
  SxProps,
  Theme
} from '@mui/material';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
  title?: string;
  variant?: TypographyOwnProps['variant'];
  description?: string;
  chip?: {
    label: string;
    color: ChipOwnProps['color'];
  };
  callToAction?: Array<ActionMenuItem | React.ReactNode>;
  accessibleTitle?: string;
  dataTestId?: string;
  sx?: SxProps<Theme>;
};

const isActionMenuItem = (
  action: ActionMenuItem | React.ReactNode
): action is ActionMenuItem => !React.isValidElement(action);

const TitleComponent = ({
  title,
  variant = 'h3',
  description,
  chip,
  callToAction,
  accessibleTitle,
  dataTestId,
  sx
}: TitleComponentProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Update page title only for main page titles (h1, h2, h3)
  // Section titles (h4, h5, h6) are considered sub-sections and don't update the browser title
  const isMainPageTitle = ['h1', 'h2', 'h3'].includes(variant || 'h3');

  /**
   * Updates the browser document title only for main page titles (h1, h2, h3).
   * This ensures that only primary page headings affect the browser tab title,
   * while section headings (h4, h5, h6) remain purely visual without changing
   * the page's identity in the browser.
   *
   * @description Uses accessibleTitle if provided for better screen reader support,
   * otherwise falls back to the display title.
   */
  useEffect(() => {
    if (isMainPageTitle) {
      const pageTitle = accessibleTitle || title;
      if (pageTitle) {
        document.title = `${pageTitle} - ${t('commons.appName')}`;
      }
    }
  }, [title, accessibleTitle, isMainPageTitle, t]);

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
          <Typography
            variant={variant}
            sx={sx}
            // render text as h1 if it's the main title, otherwise renders it as the variant provided
            {...(isMainPageTitle && { component: 'h1' as const })}
            data-testid={
              dataTestId || (isMainPageTitle ? 'main-title' : 'section-title')
            }
          >
            {title}
          </Typography>

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
