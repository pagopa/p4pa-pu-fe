import { Box, Button, Typography } from '@mui/material';

const HelloWorld = () => {



  return (
    <>
    <Box>
        <Box my={3}>
            <Typography variant='h1'>Progetto FE Piattaforma Unitaria</Typography>
            <Typography variant='h4'>Powered by MUI-Italia</Typography>
        </Box>
        <Button size='small' variant='contained'>PagoPA S.p.A.</Button>
    </Box>
    </>
  );
};

export default HelloWorld;
