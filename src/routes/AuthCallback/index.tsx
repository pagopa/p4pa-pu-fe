import { Box, CircularProgress } from '@mui/material';
import { useLoaderData } from 'react-router';
import { postToken } from '../../api/token';

export default function AuthCallback() {

  const result = useLoaderData() as Awaited<ReturnType<typeof postToken>>;

  if (result?.access_token) {
    window.localStorage.setItem('accessToken', result.access_token)
    window.location.replace('/piattaformaunitaria');
  } else {
    window.location.replace('/piattaformaunitaria#error');
  }

  return (
    <Box width={'100vw'} height={'100vh'} alignContent={'center'} textAlign={'center'}>
      <CircularProgress /> 
    </Box>
  );
}