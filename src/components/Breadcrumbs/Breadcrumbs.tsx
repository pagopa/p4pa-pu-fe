import React from 'react';
import {
  Breadcrumbs as BreadcrumbsMUI,
  useTheme,
  Typography,
  useMediaQuery,
  Stack,
  Link as MUILink
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useMatches, useNavigate } from 'react-router-dom';

export type BreadcrumbsProps = {
  separator: React.ReactElement;
};

const Breadcrumbs = ({ separator }: BreadcrumbsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const matches = useMatches();

  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const BackButton = () => (
    <Typography
      onClick={() => navigate(-1)}
      role="link"
      sx={{ cursor: 'pointer' }}
      aria-label={t('commons.back')}>
      <ArrowBack fontSize="small" color="inherit" />
    </Typography>
  );

  return (
    matches.length > 1 && (
      <Stack direction="row" marginBottom={3} alignItems="center">
        {!mdUp && <BackButton />}
        <BreadcrumbsMUI
          separator={separator}
          aria-label={t('commons.breadcrumbs')}
          sx={{ paddingBlock: 1 }}>
          { matches.slice(1).map((b, i, array) => {
            const isLastElement = i === array.length - 1;
            return <MUILink
              color="textSecondary"
              fontWeight={isLastElement ? '400' : '600'}
              component={RouterLink}
              to={b.pathname}
              underline={'hover'}
              key={`breadcrumb-${i}`}
            >
              {t(`commons.routes.${b.id}`)}
            </MUILink>;}
          )
          }
        </BreadcrumbsMUI>
      </Stack>
    )
  );
};

export default Breadcrumbs;
