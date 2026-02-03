import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const type = args[0]; // 'api' or 'fileshare'
const mode = args[1]; // 'client' or 'contracts'

const DEFAULT_URLS = {
    api: 'https://raw.githubusercontent.com/pagopa/p4pa-pu-bff/refs/heads/develop/openapi/generated.openapi.json',
    fileshare: 'https://raw.githubusercontent.com/pagopa/p4pa-fileshare/refs/heads/develop/openapi/generated.openapi.json'
};

const ENV_VARS = {
    api: 'OPENAPI_URL',
    fileshare: 'OPENAPIFILESHARE_URL'
};

const envVar = ENV_VARS[type];
let url = process.env[envVar];

if (!url || url === 'undefined') {
    url = DEFAULT_URLS[type];
}

const commands = {
    'api-client': ['swagger-typescript-api', '--extract-enums', '-p', url, '-o', './generated', '-n', 'apiClient', '--axios'],
    'api-contracts': ['swagger-typescript-api', '--extract-enums', '--modular', '--no-client', '-p', url, '-o', './generated'],
    'fileshare-client': ['swagger-typescript-api', '--extract-enums', '-p', url, '-o', './generated/fileshare', '--axios', '-n', 'fileshareClient', '--api-class-name', 'FileshareApi'],
    'fileshare-contracts': ['swagger-typescript-api', '--extract-enums', '--modular', '--no-client', '-p', url, '-o', './generated/fileshare']
};

const key = `${type}-${mode}`;
const cmdArgs = commands[key];

if (!cmdArgs) {
    console.error(`Unknown command: ${key}`);
    process.exit(1);
}

console.log(`Generating ${key} using URL: ${url}`);

const result = spawnSync('npx', cmdArgs, { stdio: 'inherit', shell: true });

if (result.status !== 0) {
    process.exit(result.status || 1);
}
