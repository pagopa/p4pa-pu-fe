import { Container, Grid } from '@mui/material';
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

const defaultRouteHandle: RouteHandleObject = {
  sidebar: { visible: true },
  crumbs: { routeName: '', elements: [] },
  backButton: false
};

export function Layout() {
  const matches = useMatches();

  const overlay = utils.sidemenu.status.overlay.value;

  document.body.style.overflow = overlay ? 'hidden' : 'auto';

  const { crumbs, sidebar, backButton, backButtonText, backButtonFunction } = {
    ...defaultRouteHandle,
    ...(matches.find((match) => Boolean(match.handle))?.handle || {})
  } as RouteHandleObject;

  const sidePadding = sidebar.visible ? 3 : { xs: 3, md: 12, lg: 27, xl: 34 };

  return (
    <>
      <Container
        maxWidth={false}
        disableGutters>
        <Grid
          container
          height={'100%'}
          minHeight="100vh"
          flexDirection="column"
          flexWrap={'nowrap'}>
          <Grid flexBasis={{ xs: 'fit-content' }} item xs={12} height="fit-content" component={'header'}>
            <Header onAssistanceClick={() => window.open('/', '_blank')} />
          </Grid>
          <Grid
            item
            display={'flex'}
            flexGrow={1}
            flexWrap={'wrap'}
            alignContent={'flex-start'}
            flexBasis={'50vh'}>
            {sidebar?.visible ? <Sidebar /> : null}
            <Grid item bgcolor={grey['100']} padding={3} height={'100%'} xs paddingX={sidePadding}>
              {backButton && <BackButton onClick={backButtonFunction} text={backButtonText} />}
              {crumbs && (
                <Breadcrumbs crumbs={crumbs} separator={<NavigateNext fontSize="small" />} />
              )}
              <Outlet />
            </Grid>
          </Grid>
          <Grid item xs={12} height="fit-content" flexBasis={{ xs: 'fit-content' }} flexShrink={3}>
            {/*xs in flex basis is specified to override mui clas.*/}
            <Footer />
          </Grid>
        </Grid>
      </Container>
      <ScrollRestoration />
    </>
  );
}
