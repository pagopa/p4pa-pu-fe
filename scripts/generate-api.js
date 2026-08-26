/**
 * Generates TypeScript API clients and contracts from local OpenAPI specs.
 *
 * Usage: node scripts/generate-api.js
 *
 * Scrapes JSON specs at the root of ./generated (see scripts/download-openapi.js)
 * and, for each spec, writes client and contracts into ./generated/<spec-name>/.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection: ${err?.message ?? err}`);
    process.exit(1);
});

const GENERATED_DIR = './generated';

const toPascalCase = (value) =>
    value
        .split(/[-_]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

const listRootJsonSpecs = (dir) => {
    if (!fs.existsSync(dir)) {
        return [];
    }

    return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
        .map((entry) => entry.name)
        .sort();
};

const runGeneration = (label, cmdArgs) => {
    console.log(`[${label}] Generating from ${cmdArgs[cmdArgs.indexOf('-p') + 1]}…`);

    const result = spawnSync('npx', cmdArgs, { stdio: 'inherit', shell: true });

    if (result.status !== 0) {
        console.error(`[${label}] Generation failed with exit code ${result.status}`);
        process.exit(result.status || 1);
    }

    console.log(`[${label}] Done`);
};

const buildCommands = (filePath, outDir, baseName) => {
    const apiClassName = `${toPascalCase(baseName)}Api`;

    return {
        client: [
            'swagger-typescript-api',
            '--extract-enums',
            '-p', filePath,
            '-o', outDir,
            '-n', 'client',
            '--axios',
            '--api-class-name', apiClassName,
        ],
        contracts: [
            'swagger-typescript-api',
            '--extract-enums',
            '--modular',
            '--no-client',
            '-p', filePath,
            '-o', outDir,
        ],
    };
};

const specFiles = listRootJsonSpecs(GENERATED_DIR);

if (specFiles.length === 0) {
    console.error(
        `No JSON specs found in ${GENERATED_DIR}. Run: node scripts/download-openapi.js`,
    );
    process.exit(1);
}

for (const specFile of specFiles) {
    const filePath = path.join(GENERATED_DIR, specFile);
    const baseName = path.basename(specFile, path.extname(specFile));
    const outDir = path.join(GENERATED_DIR, baseName);

    fs.mkdirSync(outDir, { recursive: true });

    const commands = buildCommands(filePath, outDir, baseName);

    runGeneration(`${baseName}-client`, commands.client);
    runGeneration(`${baseName}-contracts`, commands.contracts);
}