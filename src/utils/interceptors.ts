import utils from '.';
import { Client } from '../models/Client';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import navigation from './navigation';
import { useTranslation } from 'react-i18next';

export const setupInterceptors = (client: Client) => {
  const { t } = useTranslation();

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
    (error: AxiosError) => {
      const status = error.response?.status;

      if (status === 401) {
        navigation.setAuthErrorState(true);
        utils.storage.clear();
        navigation.navigateToLoggedOut();
        return Promise.resolve();
      }

      if (status === 403) {
        sessionStorage.setItem(
          'pendingNotification',
          JSON.stringify({
            message: t('commons.unauthorized'),
            type: 'error'
          })
        );
        navigation.navigateTo(navigation.routes.HOME);
        return Promise.resolve();
      }

      if (status && status >= 500 && status < 600) {
        utils.notify.emit(t('commons.serviceUnavailable'), 'error');

        console.error('Server Error:', {
          status,
          url: error.config?.url,
          method: error.config?.method,
          message: error.message
        });
      }

      return Promise.reject(error);
    }
  );
};
