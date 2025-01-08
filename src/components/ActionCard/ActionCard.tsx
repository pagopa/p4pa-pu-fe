import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

type ActionCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
  linkLabel: string;
  onActionClick: () => void;
  onLinkClick: () => void;
};

const ActionCard = ({ title, description, actionLabel, actionIcon, linkLabel, onActionClick, onLinkClick }: ActionCardProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      borderRadius="4px"
      padding="24px"
      sx={{ backgroundColor: 'background.paper', mb: 3 }}
    >
      <Typography variant="h4" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {description}
      </Typography>
      <Grid container direction="column" justifyContent={'start'}>
        <Grid item lg={12}>
          <Button
            size="large"
            startIcon={actionIcon}
            variant="outlined"
            fullWidth={false}
            onClick={onActionClick}
            sx={{ mb: 2 }}
          >
            {actionLabel}
          </Button>
        </Grid>

        <Divider orientation="horizontal" flexItem sx={{ display : 'block'}}/>

        <Grid item lg={12}>
          <Button
            size="large"
            endIcon={<ArrowForward />}
            variant="text"
            fullWidth={false}
            onClick={onLinkClick}
          >
            {linkLabel}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActionCard;
