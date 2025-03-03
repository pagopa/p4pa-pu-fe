import config from './config';
import style from './style';
import sidemenu from './sidemenu';
import loaders from './loaders';
import { Api } from '../../generated/apiClient';
import { FileshareApi } from '../../generated/fileshare/fileshareClient';

export default {
  apiClient: new Api({ baseURL: config.baseURL, timeout: config.apiTimeout }),
  fileshareClient: new FileshareApi({ baseURL: config.fileshareURL, timeout: config.apiTimeout }),
  config,
  loaders,
  sidemenu,
  style
};
