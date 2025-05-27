import config from './config';

const deployPath = config.deployPath || '';

const routes = {
  LOGGED_OUT: `${deployPath}/loggedout`,
  ERROR: `${deployPath}/error`,
  HOME: `${deployPath}/`
};

let authErrorInProgress = false;

const setAuthErrorState = (state: boolean) => {
  authErrorInProgress = state;
};

const isAuthErrorInProgress = () => authErrorInProgress;

const navigateTo = (route: string) => {
  window.location.replace(route);
};

const navigateToLoggedOut = () => {
  setAuthErrorState(true);
  navigateTo(routes.LOGGED_OUT);
};

const navigateToError = () => {
  if (!isAuthErrorInProgress()) {
    navigateTo(routes.ERROR);
  }
};

export default {
  routes,
  navigateTo,
  navigateToLoggedOut,
  navigateToError,
  setAuthErrorState,
  isAuthErrorInProgress
};
