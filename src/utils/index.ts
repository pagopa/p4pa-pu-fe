import config from './config';
import style from './style';
import sidemenu from './sidemenu';
import loaders from './loaders';
import { Api } from '../../generated/apiClient';
import { FileshareApi } from '../../generated/fileshare/fileshareClient';
import storage from './storage';
import notify from './notify';
import roles from './roles';
import filtersValidation from './filtersValidation';
import dialog from './dialog';
import URI from './URI';
import queryString from 'query-string';
import { CustomParamsSerializer } from 'axios';

/** A global custom parameters serializer:
 * - null value and empty string parameters are strippef off.
 * - arrays separated by comma.
 * - undefined parameters are always skipped.
 *
 * @example
 * const params = {
 *  a: "",
 *  b: 'test',
 *  c: null,
 *  d: [1, 2],
 *  e: undefined
 * };
 *
 * console.log(paramsSerializer(params))
 * => "b=test&d=1,2"
 *  */
const paramsSerializer: CustomParamsSerializer = (params) =>
  queryString.stringify(params, {
    skipNull: true,
    arrayFormat: 'comma',
    skipEmptyString: true
  });

export default {
  apiClient: new Api({
    baseURL: config.baseURL,
    timeout: config.apiTimeout,
    paramsSerializer
  }),
  fileshareClient: new FileshareApi({
    baseURL: config.fileshareURL,
    timeout: config.apiTimeout
  }),
  config,
  loaders,
  sidemenu,
  style,
  storage,
  notify,
  dialog,
  URI,
  roles,
  filtersValidation
};
