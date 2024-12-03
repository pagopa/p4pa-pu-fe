import { Box, Container, Grid } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Outlet, ScrollRestoration, useMatches } from 'react-router-dom';
import { BackButton } from '../BackButton';
import { NavigateNext } from '@mui/icons-material';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { RouteHandleObject } from '../../models/Breadcrumbs';


const defaultRouteHandle: RouteHandleObject = {
  sidebar: { visible: true },
  crumbs: { routeName: '', elements: [] },
  backButton: false
};

export function Layout() {
  const matches = useMatches();

  const { crumbs, backButton, backButtonText, backButtonFunction } = {
    ...defaultRouteHandle,
    ...(matches.find((match) => Boolean(match.handle))?.handle || {})
  } as RouteHandleObject;

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
          <Grid flexBasis={{ xs: 'fit-content' }} item xs={12} height="fit-content">
            <Box width={'100%'}  p={3}>HEADER ELEMENT</Box>
          </Grid>
          <Grid
            item
            display={'flex'}
            flexGrow={1}
            flexWrap={'wrap'}
            alignContent={'flex-start'}
            flexBasis={'50vh'}>
            <Box>SIDEBAR</Box>
            <Grid item bgcolor={grey['100']} padding={3} height={'100%'} xs >
              {backButton && <BackButton onClick={backButtonFunction} text={backButtonText} />}
              {crumbs && (
                <Breadcrumbs crumbs={crumbs} separator={<NavigateNext fontSize="small" />} />
              )}
              <Outlet />
            </Grid>
          </Grid>
          <Grid item xs={12} height="fit-content" flexBasis={{ xs: 'fit-content' }} flexShrink={3}>
            {/*xs in flex basis is specified to override mui clas.*/}
            <Box width={'100%'}p={3}>FOOTER</Box>
          </Grid>
        </Grid>
      </Container>
      <ScrollRestoration />
    </>
  );
}
