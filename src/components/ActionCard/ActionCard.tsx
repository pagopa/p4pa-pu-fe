import {
  Box,
  Button,
  ButtonProps,
  Divider,
  Grid,
  Typography
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

type ActionCardProps = {
  actionButtonVariant?: ButtonProps['variant'];
  actionLabel: string;
  actionIcon?: React.ReactNode;
  description: string;
  footerText?: string;
  linkLabel?: string;
  title: string;
  onActionClick: () => void;
  onLinkClick?: () => void;
};

const ActionCard = ({
  actionLabel,
  actionIcon,
  actionButtonVariant = 'outlined',
  description,
  footerText,
  linkLabel,
  title,
  onActionClick,
  onLinkClick
}: ActionCardProps) => {
  return (
    <section aria-labelledby="action-card-title">
      <Box
        component={'section'}
        aria-label={title}
        display="flex"
        flexDirection="column"
        width="100%"
        borderRadius={0.5}
        padding={3}
        sx={{ backgroundColor: 'background.paper' }}
      >
        <Typography id="action-card-title" variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography
          id="action-card-description"
          variant="body2"
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          {description}
        </Typography>
        <Grid container direction="column" justifyContent={'start'}>
          <Grid item lg={12}>
            <Button
              size="large"
              startIcon={actionIcon}
              variant={actionButtonVariant}
              fullWidth={false}
              onClick={onActionClick}
              id="action-card-btn"
            >
              {actionLabel}
            </Button>
          </Grid>

          {(footerText || linkLabel) && (
            <Divider
              orientation="horizontal"
              flexItem
              sx={{ display: 'block', my: 3 }}
            />
          )}

          {linkLabel && (
            <Grid item lg={12}>
              <Button
                id="action-card-linklabel-btn"
                size="large"
                endIcon={<ArrowForward />}
                variant="text"
                fullWidth={false}
                onClick={onLinkClick}
                sx={{ py: 1 }}
              >
                {linkLabel}
              </Button>
            </Grid>
          )}
          {footerText && (
            <Grid item lg={12}>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                {footerText}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </section>
  );
};

export default ActionCard;
