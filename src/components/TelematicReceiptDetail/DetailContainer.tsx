import { Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { TelematicReceiptDetailData } from './TelematicReceiptDetail';

type DetailSectionProps = {
  title: string;
  data: TelematicReceiptDetailData[];
};

const DetailContainer = ({ title, data }: DetailSectionProps) => {
  const theme = useTheme();

  return (
    <Card sx={{borderRadius: 2}}>
      <CardContent>
        <Typography variant='overline'>
          {title.toUpperCase()}
        </Typography>
        <Grid container direction='column' spacing={1} marginTop={1}>
          {data.map((item, index) => (
            <Grid item key={index}>
              <Typography variant='body2' color={theme.palette.action.active}>
                {item.label}
              </Typography>
              <Typography 
                fontWeight={item.variant ?? 600}
                variant= {item.variant ?? 'body1'}
              >
                {item.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetailContainer;
