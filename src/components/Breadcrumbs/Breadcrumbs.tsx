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
import { useStore } from '../../store/GlobalStore';
import { RouteHandleObject } from '../../models/Routes';

export type BreadcrumbsProps = {
  separator: React.ReactElement;
  custom?: boolean;
};

export type BredcrumbItem = {
  id: string;
  pathname: string;
  label?: string;
  handle?: RouteHandleObject;
};

const Breadcrumbs = ({ separator, custom }: BreadcrumbsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { appState }
  } = useStore();
  const matches = (useMatches() as Array<BredcrumbItem>).slice(1);
  const customBreadcrumbsItems = appState.customBreadcrumbsItems;
  const items = customBreadcrumbsItems || undefined;
  const itemsToList = custom ? items || matches : matches;

  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const BackButton = () => (
    <Typography
      onClick={() => navigate(-1)}
      role="link"
      sx={{ cursor: 'pointer' }}
      aria-label={t('commons.back')}
    >
      <ArrowBack fontSize="small" color="inherit" />
    </Typography>
  );

  return itemsToList?.length > 0 ? (
    <Stack direction="row" marginBottom={3} alignItems="center">
      {!mdUp && <BackButton />}
      <BreadcrumbsMUI
        separator={separator}
        aria-label={t('commons.breadcrumbs')}
        sx={{ paddingBlock: 1 }}
      >
        {itemsToList
          .filter((item) => !item.handle?.hideBreadcrumbElement)
          .map((b, i, array) => {
            const isLastElement = i === array.length - 1;
            return (
              <MUILink
                color="textSecondary"
                fontWeight={isLastElement ? '400' : '600'}
                component={RouterLink}
                to={b.pathname}
                underline={'hover'}
                key={`breadcrumb-${i}`}
              >
                {b.label ? b.label : t(`commons.routes.${b.id}`)}
              </MUILink>
            );
          })}
      </BreadcrumbsMUI>
    </Stack>
  ) : null;
};

export default Breadcrumbs;
