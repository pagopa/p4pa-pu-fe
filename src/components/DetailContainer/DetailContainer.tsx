import {
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  Chip,
  ChipOwnProps,
  Button,
  Divider,
  TypographyOwnProps,
  Stack
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  formatDate,
  formatDateTime,
  moneyFormat
} from '../../utils/formatters';
import React from 'react';

export type DetailData = {
  label?: string;
  value?: string | number;
  valueType?: 'amount' | 'date' | 'dateTime' | 'status' | 'withicon';
  variant?: 'body1' | 'body2' | 'h6' | 'subtitle1' | 'monospaced';
  chipConfig?: {
    color?: ChipOwnProps['color'];
    variant?: ChipOwnProps['variant'];
  };
  childrenComponent?: React.ReactNode;
  iconConfig?: {
    icon: React.ReactNode;
  };
};

export type titleConfig = {
  label?: string;
} & TypographyOwnProps;

export type footerLinkConfig = {
  label: string;
  icon?: React.ReactNode;
  onLinkClick?: () => void;
  iconPosition?: 'left' | 'right';
};

export type DetailSection = {
  title?: titleConfig;
  description?: string;
  data: Array<DetailData>;
  inline?: boolean;
  inlineSizeFirstElement?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  footerLink?: footerLinkConfig;
  divider?: boolean;
};

export type DetailSectionProps = {
  sections: Array<DetailSection>;
  fullWidthSections?: boolean;
  omitFlexGridDirection?: boolean;
};

type Status = 'Pagato';

const stateColors: Record<Status, ChipOwnProps['color']> = {
  Pagato: 'success'
};

const DetailContainer = ({
  sections,
  fullWidthSections,
  omitFlexGridDirection = false
}: DetailSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const renderItemValue = (item: DetailData): JSX.Element => {
    if (item.childrenComponent) {
      return <>{item.childrenComponent}</>;
    }

    if (item.valueType === 'status' && item.value) {
      return (
        <React.Fragment>
          <Chip
            color={item.chipConfig?.color ?? stateColors[item.value as Status]}
            label={t(`commons.status.${item.value}`)}
            variant={item.chipConfig?.variant}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Typography
          fontWeight={item.variant ?? 600}
          variant={item.variant ?? 'body1'}
          sx={{ wordBreak: 'break-word' }}
        >
          {
            // eslint-disable-next-line sonarjs/function-return-type
            (() => {
              if (item.valueType === 'amount') {
                return moneyFormat(
                  typeof item.value === 'number'
                    ? item.value
                    : Number(item.value)
                );
              }
              if (item.valueType === 'date') {
                if (!item.value || item.value === '') return '-';

                const dateValue = new Date(item.value);
                if (isNaN(dateValue.getTime())) return '-';

                const formattedDate = formatDate(`${item.value}`);
                return formattedDate || '-';
              }
              if (item.valueType === 'dateTime') {
                if (!item.value || item.value === '') return '-';

                const dateValue = new Date(item.value);
                if (isNaN(dateValue.getTime())) return '-';

                const formattedDateTime = formatDateTime(`${item.value}`);
                return formattedDateTime || '-';
              }
              if (
                item.valueType === 'withicon' &&
                item.iconConfig !== undefined
              ) {
                const iconConfig = item.iconConfig;
                return (
                  <Stack direction={'row'} justifyContent={'space-between'}>
                    {item.value} {iconConfig.icon}
                  </Stack>
                );
              }
              return item.value || '-';
            })()
          }
        </Typography>
      </React.Fragment>
    );
  };

  return (
    <Card sx={{ borderRadius: 2, height: 'auto' }}>
      <CardContent>
        <Grid container spacing={2}>
          {sections.map((section, index) => {
            const iconPosition = section.footerLink?.iconPosition || 'left';
            const setColumnWidth = section.inlineSizeFirstElement
              ? 12 - section.inlineSizeFirstElement
              : 6;
            return (
              <Grid
                item
                xs={12}
                md={fullWidthSections || sections.length === 1 ? 12 : 6}
                key={index}
              >
                {section.title ? (
                  <Typography {...section.title}>
                    {section.title.label}
                  </Typography>
                ) : null}
                {section.description ? (
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, wordBreak: 'break-word' }}
                  >
                    {section.description}
                  </Typography>
                ) : null}
                <Grid
                  py={1}
                  container
                  direction={omitFlexGridDirection ? undefined : 'column'}
                >
                  {section.data.map((item, index) => (
                    <Grid
                      container
                      py={1}
                      key={index}
                      direction={section.inline ? 'row' : 'column'}
                    >
                      {item.label && (
                        <Grid
                          item
                          md={
                            section.inline
                              ? section.inlineSizeFirstElement || 6
                              : 12
                          }
                        >
                          <Typography
                            variant="body2"
                            color={theme.palette.action.active}
                          >
                            {item.label}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item md={section.inline ? setColumnWidth : 12}>
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
                          section.footerLink.icon && iconPosition === 'left'
                            ? section.footerLink.icon
                            : undefined
                        }
                        endIcon={
                          section.footerLink.icon && iconPosition === 'right'
                            ? section.footerLink.icon
                            : undefined
                        }
                        variant="text"
                        fullWidth={false}
                        onClick={section.footerLink.onLinkClick}
                        sx={{
                          justifyContent: 'flex-start',
                          paddingLeft: 0,
                          fontWeight: 700,
                          fontSize: 16
                        }}
                      >
                        {section.footerLink.label}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetailContainer;
