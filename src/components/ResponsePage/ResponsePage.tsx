import React from 'react';
import { Button, ButtonOwnProps, Grid, Typography } from '@mui/material';

export type ButtonConfig = {
  variant?: ButtonOwnProps['variant'];
  size?: ButtonOwnProps['size'];
  buttonLabel?: string;
  actionID?: string;
  customNavigation?: string;
  onButtonClick?: () => void;
};

type ResponsePageProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonConfig?: Array<ButtonConfig>;
};

const ResponsePage = ({
  icon,
  title,
  description,
  buttonConfig
}: ResponsePageProps) => {
  return (
    <>
      <Grid container direction="column" alignItems="center" marginTop={8}>
        {
          <Grid item marginBottom={3}>
            {icon}
          </Grid>
        }
        <Grid item marginBottom={1}>
          <Typography align="center" variant="h3">
            {title}
          </Typography>
        </Grid>
        {
          <Grid item>
            <Typography align="center" variant="body1" marginBottom={3}>
              {description}
            </Typography>
          </Grid>
        }
        {buttonConfig &&
          buttonConfig.map((btn, index) => (
            <Grid item key={`${btn.buttonLabel}-${index}`} marginTop={1}>
              <Button
                size={btn.size}
                variant={btn.variant}
                onClick={btn.onButtonClick}
              >
                {btn.buttonLabel}
              </Button>
            </Grid>
          ))}
      </Grid>
    </>
  );
};

export default ResponsePage;
