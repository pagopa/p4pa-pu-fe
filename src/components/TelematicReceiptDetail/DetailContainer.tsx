import { Card, CardContent, Typography, Grid, useTheme } from '@mui/material';

type DetailSectionProps = {
  title: string;
  data: { label: string; value: string | number }[];
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
              <Typography fontSize={16} color={theme.palette.action.active}>
                {item.label}
              </Typography>
              <Typography 
                fontSize={item.label === 'IUV' ? 16 : 18}
                fontWeight={item.label === 'IUV' ? 400 : 600}
                color={theme.palette.text.primary}
                variant= {item.label === 'IUV' ? 'monospaced' : 'inherit'}
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
