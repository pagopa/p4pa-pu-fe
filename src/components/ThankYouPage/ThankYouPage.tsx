import React from 'react';
import { Button, Grid, Typography } from '@mui/material';

type ThankYouPageProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonLabel?: string; 
    onButtonClick: () => void;
};

const ThankYouPage = ({ icon, title, description, buttonLabel, onButtonClick }: ThankYouPageProps) => {

  return (
    <>
      <Grid container direction="column" alignItems="center" marginTop={8}>
        {(
          <Grid item marginBottom={3}>
            {icon}
          </Grid>
        )}
        <Grid item marginBottom={1}>
          <Typography align='center' variant="h3">{title}</Typography>
        </Grid>
        {(
          <Grid item>
            <Typography align='center' variant="body1" marginBottom={3}>
              {description}
            </Typography>
          </Grid>
        )}
        {buttonLabel && onButtonClick && (
          <Button size="large" variant="contained" onClick={onButtonClick}>
            {buttonLabel}
          </Button>
        )}
      </Grid>
    </>
  );
};

export default ThankYouPage;
