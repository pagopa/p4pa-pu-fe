import { Client } from '../../models/Client';
import { Outlet } from 'react-router-dom';
import { setupInterceptors } from '../../utils/interceptors';

type ApiClientProps = {
  clients: Client[];
};

export const ApiClient = ({ clients }: ApiClientProps) => {

  clients.forEach((c) => {
    setupInterceptors(c);
  });

  return <Outlet />;
};
