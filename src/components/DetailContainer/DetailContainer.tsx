import { Card, CardContent, Typography, Grid, useTheme, Chip, ChipOwnProps } from '@mui/material';

export interface DetailData {
  label: string;
  value: string;
  variant?: 'body1' | 'body2' | 'h6' | 'subtitle1' | 'monospaced';
}

type DetailSectionProps = {
  sections: {
    title?: string;
    data: DetailData[];
    inline?: boolean;
  }[]
};

const stateColors: Record<DetailData['value'], ChipOwnProps['color']> = {
  'Pagato': 'success',
  //TODO
};

const DetailContainer = ({ sections }: DetailSectionProps) => {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 2, padding: 2, height: 'auto' }}>
      <CardContent>
        <Grid container spacing={2}>
          {sections.map((section, index) => (
            <Grid item md={sections.length === 1 ? 12 : 6} key={index}>
              {section.title ? (
                <Typography variant='overline'>
                  {section.title.toUpperCase()}
                </Typography>
              ) : null}
              <Grid container direction='column' >
                {section.data.map((item, index) => (
                  <Grid container spacing={1} marginTop={1} key={index} direction={section.inline ? 'row' : 'column'}>
                    <Grid item lg={section.inline ? 6 : 12} md={section.inline ? 6 : 12}>
                      <Typography variant='body2' color={theme.palette.action.active}>
                        {item.label}
                      </Typography>
                    </Grid>
                    <Grid item lg={section.inline ? 6 : 12} md={section.inline ? 6 : 12}>
                      {item.label === 'Stato' ? (
                        <Chip
                          color={stateColors[item.value]}
                          label={item.value}
                        />
                      ): (
                        <Typography
                          fontWeight={item.variant ?? 600}
                          variant= {item.variant ?? 'body1'}
                        >
                          {item.value || '-'}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetailContainer;
