import {
  Alert,
  Button,
  Container,
  Grid,
  Snackbar,
  Stack,
  Theme,
  useMediaQuery
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { Outlet, ScrollRestoration, useMatches } from 'react-router';
import { BackButton } from '../BackButton';
import { NavigateNext } from '@mui/icons-material';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { RouteHandleObject } from '../../models/Routes';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar/Sidebar';
import utils from '../../utils';
import { Footer } from '../Footer';
import useCollapseMenu from '../../hooks/useCollapseMenu';
import { useFooterData } from '../../hooks/useFooterData';
import { useTranslation } from 'react-i18next';
import GenericDialog from '../GenericDialog/GenericDialog';
import '../../style.css';
import { RouteChangeAnnouncement } from '../RouteChangeAnnouncement';

const defaultRouteHandle: RouteHandleObject = {
  backButton: true,
  custom: false,
  hideBreadcrumbs: false,
  sidebar: { visible: true },
  backButtonText: 'commons.back' // <- default: Indietro
};

export function Layout() {
  const matches = useMatches();
  const footerData = useFooterData();
  const currentMatch = matches.length > 1 ? matches.slice(-1) : matches;

  const overlay = utils.sidemenu.status.overlay.value;

  document.body.style.overflow = overlay ? 'hidden' : 'auto';

  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const { collapsed } = useCollapseMenu(!lg);
  const getMainColumnWidth = () => {
    if (!sidebar.visible) return 12;
    return collapsed ? 11 : 9;
  };

  const {
    custom,
    hideBreadcrumbs,
    sidebar,
    backButton,
    backButtonText,
    backButtonFunction
  } = {
    ...defaultRouteHandle,
    ...(currentMatch.find((match) => Boolean(match.handle))?.handle || {})
  } as RouteHandleObject;

  const { t } = useTranslation();
  const sidePadding = sidebar.visible ? 3 : { xs: 3, md: 12, lg: 27, xl: 34 };
  const mainColumnWidth = getMainColumnWidth();

  const skitToContent = () => {
    const mainContent = document.getElementById('main-content');
    mainContent?.focus();
  };

  return (
    <>
      <RouteChangeAnnouncement />
      <Button
        id="skip-to-content"
        color="primary"
        variant="contained"
        onClick={skitToContent}
        size="large"
      >
        {t('commons.skipToContent')}
      </Button>
      <GenericDialog
        {...utils.dialog.status.dialogPayload.value}
        open={utils.dialog.status.isDialogVisible.value}
      />
      <Snackbar
        autoHideDuration={6000}
        onClose={utils.notify.dismiss}
        open={utils.notify.status.isVisible.value}
      >
        <Alert
          severity={utils.notify.status.payload.value?.severity}
          variant="outlined"
        >
          {utils.notify.status.payload.value?.text}
        </Alert>
      </Snackbar>
      <Container maxWidth={false} disableGutters>
        <Grid
          container
          direction={'column'}
          height={'100%'}
          minHeight="100vh"
          bgcolor={grey['100']}
        >
          <Grid item xs={12} height="fit-content" component={'header'}>
            <Header onAssistanceClick={() => window.open('/', '_blank')} />
          </Grid>
          <Grid container direction={'row'} flexGrow={1}>
            {sidebar?.visible ? <Sidebar /> : null}
            <Grid
              item
              bgcolor={grey['100']}
              padding={3}
              height={'100%'}
              xs={mainColumnWidth}
              paddingX={sidePadding}
              id="main-content"
              tabIndex={0}
            >
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
              >
                {backButton && (
                  <BackButton
                    onClick={backButtonFunction}
                    text={t(backButtonText ?? 'commons.back')}
                  />
                )}

                {!hideBreadcrumbs && (
                  <Breadcrumbs
                    custom={custom}
                    separator={<NavigateNext fontSize="small" />}
                  />
                )}
              </Stack>
              <Outlet />
            </Grid>
          </Grid>
          <Grid item xs={12} height="fit-content" mt={'auto'}>
            <Footer {...footerData} />
          </Grid>
        </Grid>
      </Container>
      <ScrollRestoration />
    </>
  );
}
