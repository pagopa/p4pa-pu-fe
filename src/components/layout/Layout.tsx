import { Container, Grid, Stack, Theme, useMediaQuery } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Outlet, ScrollRestoration, useMatches } from 'react-router-dom';
import { BackButton } from '../BackButton';
import { NavigateNext } from '@mui/icons-material';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { RouteHandleObject } from '../../models/Breadcrumbs';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar/Sidebar';
import utils from '../../utils';
import { Footer } from '../Footer';
import useCollapseMenu from '../../hooks/useCollapseMenu';
import { useFooterData } from '../../hooks/useFooterData';

const defaultRouteHandle: RouteHandleObject = {
  sidebar: { visible: true },
  crumbs: { routeName: '', elements: [] },
  backButton: false
};

export function Layout() {
  const matches = useMatches();
  const footerData = useFooterData();

  const overlay = utils.sidemenu.status.overlay.value;

  document.body.style.overflow = overlay ? 'hidden' : 'auto';

  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const { collapsed } = useCollapseMenu(!lg);

  const { crumbs, sidebar, backButton, backButtonText, backButtonFunction } = {
    ...defaultRouteHandle,
    ...(matches.find((match) => Boolean(match.handle))?.handle || {})
  } as RouteHandleObject;

  const sidePadding = sidebar.visible ? 3 : { xs: 3, md: 12, lg: 27, xl: 34 };

  return (
    <>
      <Container maxWidth={false} disableGutters>
        <Grid
          container
          direction={'column'}
          height={'100%'}
          minHeight="100vh"
          bgcolor={grey['100']}>
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
              xs={12}
              lg={collapsed ? 11 : 10}
              paddingX={sidePadding}>
              <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                {backButton && <BackButton onClick={backButtonFunction} text={backButtonText} />}
                {crumbs && (
                  <Breadcrumbs crumbs={crumbs} separator={<NavigateNext fontSize="small" />} />
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
