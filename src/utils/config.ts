import { RootLinkType } from '@pagopa/mui-italia';
import { z, ZodError } from 'zod';

/** Useful default values  */
/** APIHOST default value works in conjunction with the proxy server. See the .proxyrc file */
const {
  DEPLOY_PATH = '/piattaformaunitaria',
} = import.meta.env;

// ENV variables validation

const DEPLOY_PATH_schema = z.string();

try {
  DEPLOY_PATH_schema.parse(DEPLOY_PATH);
} catch (e) {
  console.error('ENV variables validation fails', (e as ZodError).issues);
}

type Config = {
  deployPath: string;
  pagopaLink: RootLinkType;
  tokenHeaderExcludePaths: string[];
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
  deployPath: DEPLOY_PATH,
  /** This array is populated by paths that don't need a auth token */
  tokenHeaderExcludePaths: ['/token/']
};

export default config;
