import { Typography } from '@mui/material';
import { useEffect } from 'react';
import utils from '../../utils';

const Home = () => {
  useEffect(() => {
    const pendingNotification = sessionStorage.getItem('pendingNotification');
    if (pendingNotification) {
      const { message, type } = JSON.parse(pendingNotification);
      utils.notify.emit(message, type);
      sessionStorage.removeItem('pendingNotification');
    }
  }, []);

  return (
    <>
      <Typography variant="h3">HOME</Typography>
    </>
  );
};

export default Home;
