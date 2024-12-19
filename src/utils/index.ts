import config from './config';
import style from './style';
import sidemenu from './sidemenu';
import loaders from './loaders';
import { Api } from '../../generated/apiClient';

export default {
  apiClient: new Api({ baseURL: config.baseURL, timeout: config.apiTimeout }),
  config,
  loaders,
  sidemenu,
  style
};
