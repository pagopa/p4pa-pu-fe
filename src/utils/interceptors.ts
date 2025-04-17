import utils from '.';
import { Client } from '../models/Client';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import navigation from './navigation';

export const setupInterceptors = (client: Client) => {
  client.instance.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => {
      const tokenHeaderExcludePaths: Array<string> =
        utils.config.tokenHeaderExcludePaths;
      const routeUrl = request.url || '';
      const accessToken = window.localStorage.getItem('accessToken');
      if (accessToken && !tokenHeaderExcludePaths.includes(routeUrl)) {
        request.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return request;
    },
    (error: Promise<AxiosError>) => {
      return Promise.reject(error);
    }
  );

  client.instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        navigation.setAuthErrorState(true);

        utils.storage.clear();
        navigation.navigateToLoggedOut();

        return Promise.resolve();
      }

      return Promise.reject(error);
    }
  );
};
