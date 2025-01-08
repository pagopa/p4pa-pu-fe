import { Client } from '../../models/Client';
import { Outlet } from 'react-router-dom';
import { setupInterceptors } from '../../utils/interceptors';


type ApiClientProps = {
  client: Client;
};

export const ApiClient = ({ client }: ApiClientProps) => {
  setupInterceptors(client);

  return <Outlet />;
};
