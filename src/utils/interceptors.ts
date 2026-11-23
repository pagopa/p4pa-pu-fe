import utils from '.';
import type { Client } from '../models/Client';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import navigation from './navigation';
import i18n from '../translations/i18n';
import { appState } from '../store/AppStateStore';
import router, { PageRoutes } from '../routes';
import refreshToken from './auth';

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
    async (error: AxiosError) => {
      const status = error.response?.status;
      const isApplicationReady = appState.value.ready === true;
      if (status === 401) {
        // If the request was for refreshing the token, reject immediately to avoid infinite loop
        if (error.config?.url?.split('?')[0].includes('refresh')) {
          return Promise.reject(error);
        }
        // Attempt to refresh the token and retry the request
        try {
          const newToken = await refreshToken();
          // Retry the original request with the new token
          if (newToken.access_token && error.config?.headers) {
            error.config.headers['Authorization'] =
              `Bearer ${newToken.access_token}`;
            return client.instance.request(error.config);
          }
        } catch {
          // If refreshing the token fails, handle the error and navigate to logged out state
          navigation.setAuthErrorState(true);
          utils.storage.clear();
          navigation.navigateToLoggedOut();
          return Promise.reject(error);
        }
      }

      if (status === 400) {
        console.error(error);
        router.navigate(PageRoutes.RESPONSES_ERROR, { replace: true });
        return Promise.reject(error);
      }

      if (status === 403) {
        if (isApplicationReady) {
          sessionStorage.setItem(
            'pendingNotification',
            JSON.stringify({
              message: i18n.t('commons.unauthorized'),
              type: 'error'
            })
          );
          router.navigate(PageRoutes.HOME);
          return Promise.resolve();
        }
        return Promise.reject();
      }

      if (status === 404) {
        if (isApplicationReady) {
          utils.notify.emit(i18n.t('commons.notFound'));
          return Promise.resolve();
        }
        return Promise.reject();
      }

      if (status && status >= 500 && status < 600) {
        utils.notify.emit(i18n.t('commons.serviceUnavailable'), 'error');

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
