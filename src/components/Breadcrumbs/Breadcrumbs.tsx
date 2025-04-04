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

export type BreadcrumbsProps = {
  separator: React.ReactElement;
  custom?: boolean;
  goOut?: boolean;
};

export type BredcrumbItem = {
  id: string;
  pathname: string;
  label?: string;
};

const Breadcrumbs = ({ separator, custom, goOut }: BreadcrumbsProps) => {
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
  console.log('goOut', goOut);

  const BackButton = () => (
    <Typography
      onClick={() => navigate(-1)}
      role="link"
      sx={{ cursor: 'pointer' }}
      aria-label={!goOut ? t('commons.back') : 'Esci'}
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
        {itemsToList.map((b, i, array) => {
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
