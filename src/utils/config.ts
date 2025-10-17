import { RootLinkType } from '@pagopa/mui-italia';
import { z, ZodError } from 'zod';
import queryString from 'query-string';
import { CustomParamsSerializer } from 'axios';

/** Useful default values  */
/** APIHOST default value works in conjunction with the proxy server. See the .proxyrc file */
const {
  VITE_DEPLOY_PATH = '/piattaformaunitaria',
  VITE_APIHOST = 'http://localhost',
  VITE_FILESHARE_APIHOST = 'http://localhost',
  VITE_API_TIMEOUT = '10000',
  VITE_LOGIN_URL = '/login',
  VITE_STATS_URL = 'https://analytics.internal.dev.p4pa.pagopa.it'
} = import.meta.env;
const PARSED_API_TIMEOUT = Number.parseInt(VITE_API_TIMEOUT, 10);

// ENV variables validation

const DEPLOY_PATH_schema = z.string();
const APIHOST_schema = z.string().url();
const FILESHARE_APIHOST_schema = z.string().url();
const API_TIMEOUT_schema = z.number();
const STATS_URL_schema = z.string().url();

try {
  DEPLOY_PATH_schema.parse(VITE_DEPLOY_PATH);
  APIHOST_schema.parse(import.meta.env.VITE_APIHOST);
  FILESHARE_APIHOST_schema.parse(import.meta.env.VITE_FILESHARE_APIHOST);
  API_TIMEOUT_schema.parse(PARSED_API_TIMEOUT);
  STATS_URL_schema.parse(VITE_STATS_URL);
} catch (e) {
  console.error('ENV variables validation fails', (e as ZodError).issues);
}

type Config = {
  deployPath: string;
  pagopaLink: RootLinkType;
  tokenHeaderExcludePaths: Array<string>;
  baseURL: string;
  fileshareURL: string;
  apiTimeout: number;
  loginUrl: string;
  statsUrl: string;
  paramsSerializer: CustomParamsSerializer;
};

const pagopaLink: RootLinkType = {
  label: 'PagoPA S.p.A.',
  href: 'https://www.pagopa.it/',
  ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
  title: 'Sito di PagoPA S.p.A.'
};

const config: Config = {
  /** Running version, usually valued by pipelines */
  // version: VERSION,
  /** the prefix of all api calls
   *  works in conjunction with the auto generated API client
   *  see the command generate in the package.json file
   */
  pagopaLink,
  /** after timeout api call is aborted
   * if settet to 0 will wait indefinitely
   **/
  apiTimeout: PARSED_API_TIMEOUT,
  /** the prefix of all api calls works
   * in conunction with the auto generated
   * API client see the command generate
   * in the package.json file
   **/
  baseURL: VITE_APIHOST,
  fileshareURL: VITE_FILESHARE_APIHOST,
  deployPath: VITE_DEPLOY_PATH,
  loginUrl: VITE_LOGIN_URL,
  statsUrl: VITE_STATS_URL,
  /** This array is populated by paths that don't need a auth token */
  tokenHeaderExcludePaths: ['/auth-callback', '/checkout-callback/*'],
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
  paramsSerializer: (params) =>
    queryString.stringify(params, {
      skipNull: true,
      arrayFormat: 'comma',
      skipEmptyString: true
    })
};

export default config;
