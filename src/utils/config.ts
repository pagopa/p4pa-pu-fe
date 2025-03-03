import { RootLinkType } from '@pagopa/mui-italia';
import { z, ZodError } from 'zod';

/** Useful default values  */
/** APIHOST default value works in conjunction with the proxy server. See the .proxyrc file */
const {
  VITE_DEPLOY_PATH = '/piattaformaunitaria',
  VITE_APIHOST = 'http://localhost',
  VITE_FILESHARE_APIHOST = 'http://localhost',
  VITE_API_TIMEOUT = '10000'
} = import.meta.env;
const PARSED_API_TIMEOUT = Number.parseInt(VITE_API_TIMEOUT, 10);

// ENV variables validation

const DEPLOY_PATH_schema = z.string();
const APIHOST_schema = z.string().url();
const FILESHARE_APIHOST_schema = z.string().url();
const API_TIMEOUT_schema = z.number();

try {
  DEPLOY_PATH_schema.parse(VITE_DEPLOY_PATH);
  APIHOST_schema.parse(import.meta.env.VITE_APIHOST);
  FILESHARE_APIHOST_schema.parse(import.meta.env.VITE_FILESHARE_APIHOST);
  API_TIMEOUT_schema.parse(PARSED_API_TIMEOUT);
} catch (e) {
  console.error('ENV variables validation fails', (e as ZodError).issues);
}

type Config = {
  deployPath: string;
  pagopaLink: RootLinkType;
  tokenHeaderExcludePaths: string[];
  baseURL: string;
  fileshareURL: string;
  apiTimeout: number;
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
  /** This array is populated by paths that don't need a auth token */
  tokenHeaderExcludePaths: ['/token/']
};

export default config;
