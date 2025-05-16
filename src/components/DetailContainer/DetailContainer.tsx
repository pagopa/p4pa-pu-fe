import {
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  Chip,
  ChipOwnProps,
  Button,
  Divider
} from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { useTranslation } from 'react-i18next';
import { moneyFormat } from '../../utils/formatters';
import React from 'react';
export type DetailData = {
  label: string;
  value: string | number;
  variant?: 'body1' | 'body2' | 'h6' | 'subtitle1' | 'monospaced';
  chipConfig?: {
    color?: ChipOwnProps['color'];
    variant?: ChipOwnProps['variant'];
  };
  childrenComponent?: React.ReactNode;
};
export type titleConfig = {
  label: string;
  variant?: Variant;
  uppercase?: boolean;
};
export type footerLinkConfig = {
  label: string;
  icon?: React.ReactNode;
  onLinkClick?: () => void;
};

export type DetailSectionProps = {
  sections: Array<{
    title?: titleConfig;
    data: Array<DetailData>;
    inline?: boolean;
    footerLink?: footerLinkConfig;
    divider?: boolean;
  }>;
  fullWidthSections?: boolean;
};

const stateColors: Record<DetailData['value'], ChipOwnProps['color']> = {
  Pagato: 'success'
};

const DetailContainer = ({
  sections,
  fullWidthSections
}: DetailSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const renderItemValue = (item: DetailData): JSX.Element => {
    if (item.label === t('commons.state')) {
      return (
        <React.Fragment>
          <Chip
            color={item.chipConfig?.color ?? stateColors[item.value]}
            label={t(`commons.status.${item.value}`)}
            variant={item.chipConfig?.variant}
          />
        </React.Fragment>
      );
    }

    if (item.label === t('commons.amount')) {
      return (
        <React.Fragment>
          <Typography
            fontWeight={item.variant ?? 600}
            variant={item.variant ?? 'body1'}
          >
            {moneyFormat(
              typeof item.value === 'number' ? item.value : Number(item.value)
            )}
          </Typography>
        </React.Fragment>
      );
    }

    if (item.childrenComponent) {
      return <>{item.childrenComponent}</>;
    }

    return (
      <React.Fragment>
        <Typography
          fontWeight={item.variant ?? 600}
          variant={item.variant ?? 'body1'}
        >
          {item.value || '-'}
        </Typography>
      </React.Fragment>
    );
  };

  return (
    <Card sx={{ borderRadius: 2, height: 'auto' }}>
      <CardContent>
        <Grid container spacing={2}>
          {sections.map((section, index) => (
            <Grid
              item
              xs={12}
              md={fullWidthSections || sections.length === 1 ? 12 : 6}
              key={index}
            >
              {section.title ? (
                <Typography variant={section.title.variant}>
                  {section.title.uppercase
                    ? section.title.label.toUpperCase()
                    : section.title.label}
                </Typography>
              ) : null}
              <Grid container direction="column">
                {section.data.map((item, index) => (
                  <Grid
                    container
                    spacing={1}
                    marginTop={1}
                    key={index}
                    direction={section.inline ? 'row' : 'column'}
                  >
                    <Grid
                      item
                      lg={section.inline ? 6 : 12}
                      md={section.inline ? 6 : 12}
                    >
                      <Typography
                        variant="body2"
                        color={theme.palette.action.active}
                      >
                        {item.label}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      lg={section.inline ? 6 : 12}
                      md={section.inline ? 6 : 12}
                    >
                      {renderItemValue(item)}
                    </Grid>
                    {section.divider && index !== section.data.length - 1 && (
                      <Divider
                        orientation="horizontal"
                        flexItem
                        sx={{ display: 'block', mt: 1 }}
                      />
                    )}
                  </Grid>
                ))}
                {section.footerLink && (
                  <Grid item xs={12} sx={{ mt: 3, textAlign: 'left' }}>
                    <Button
                      size="small"
                      startIcon={
                        section.footerLink.icon
                          ? section.footerLink.icon
                          : undefined
                      }
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
