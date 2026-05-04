import { Box, CircularProgress } from '@mui/material';
import { useLoaderData, useNavigate } from 'react-router';
import { postTokenOrError } from '../../api/token';
import { setIdToken } from '../../store/IdTokenStore';
import { useEffect } from 'react';
import { PageRoutes } from '../';

export default function AuthCallback() {
  const result = useLoaderData() as Awaited<
    ReturnType<typeof postTokenOrError>
  >;
  const navigate = useNavigate();

  useEffect(() => {
    if (result?.token.access_token) {
      window.localStorage.setItem('accessToken', result.token.access_token);
      setIdToken(result.idToken);
      navigate(PageRoutes.HOME);
    } else {
      window.location.replace(PageRoutes.ERROR);
    }
  }, [result]);

  return (
    <Box
      width={'100vw'}
      height={'100vh'}
      alignContent={'center'}
      textAlign={'center'}
    >
      <CircularProgress />
    </Box>
  );
}
