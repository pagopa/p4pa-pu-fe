import { Card, CardContent, Typography, Grid, useTheme, Chip, ChipOwnProps, Button, Divider } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { useTranslation } from 'react-i18next';
export interface DetailData {
  label: string;
  value: string;
  variant?: 'body1' | 'body2' | 'h6' | 'subtitle1' | 'monospaced';
  chipConfig?: { color?: ChipOwnProps['color'], variant?: ChipOwnProps['variant'] };
};
export interface titleConfig {
  label: string,
  variant?: Variant;
  uppercase?: boolean;
};
export interface footerLinkConfig {
  label: string,
  icon?: React.ReactNode;
  onLinkClick?: () => void;
};

type DetailSectionProps = {
  sections: {
    title?: titleConfig;
    data: DetailData[];
    inline?: boolean;
    footerLink?: footerLinkConfig;
    divider?: boolean;
  }[]
};

const stateColors: Record<DetailData['value'], ChipOwnProps['color']> = {
  'Pagato': 'success',
  //TODO
};

const DetailContainer = ({ sections }: DetailSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card sx={{ borderRadius: 2, padding: 2, height: 'auto' }}>
      <CardContent>
        <Grid container spacing={2}>
          {sections.map((section, index) => (
            <Grid item md={sections.length === 1 ? 12 : 6} key={index}>
              {section.title ? (
                <Typography variant={section.title.variant}>
                  {section.title.uppercase ? section.title.label.toUpperCase() : section.title.label}
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
                          color={item.chipConfig?.color ?? stateColors[item.value]}
                          label={t(`commons.chipStaus.${item.value}`)}
                          variant={item.chipConfig?.variant}
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
                    {section.divider && index !== section.data.length -1 && (
                      <Divider orientation="horizontal" flexItem sx={{ display: 'block', mt: 1}}/>
                    )}
                  </Grid>
                ))}
                {section.footerLink && (
                  <Grid item xs={12} sx={{ mt: 3, textAlign: 'left' }}>
                    <Button
                      size="small"
                      startIcon={section.footerLink.icon ? section.footerLink.icon : undefined}
                      variant="text"
                      fullWidth={false}
                      onClick={section.footerLink.onLinkClick}
                      sx={{ justifyContent: 'flex-start', paddingLeft: 0 }}
                    >
                      {section.footerLink.label}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetailContainer;
