/**
 * Downloads OpenAPI specs from env vars whose names contain "OPENAPI"
 * and removes `nullable: true` fields.
 *
 * Usage: node scripts/download-openapi.js
 *
 * Reads system env vars and project-root `.env` (via dotenv).
 * System env vars take precedence over `.env`.
 * Defaults are used only for OPENAPI_URL and OPENAPI_FILESHARE_URL.
 * Output files are named from the env var suffix, e.g. OPENAPI_FILESHARE_URL -> generated/fileshare.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT_DIR, '.env') });
const environmentName = process.env.ENV?.trim().toLowerCase() || 'unknown';

// Unhandled rejection guard
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection: ${err?.message ?? err}`);
    process.exit(1);
});

const DEFAULT_URLS = {
    OPENAPI_URL:
        'https://raw.githubusercontent.com/pagopa/p4pa-pu-bff/refs/heads/develop/openapi/generated.openapi.json',
    OPENAPI_FILESHARE_URL:
        'https://raw.githubusercontent.com/pagopa/p4pa-fileshare/refs/heads/develop/openapi/generated.openapi.json',
};

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

const isUsableValue = (value) =>
    typeof value === 'string' && value.trim() !== '' && value !== 'undefined';

const resolveSources = () => {
    const sources = {};

    for (const [name, defaultUrl] of Object.entries(DEFAULT_URLS)) {
        const envValue = process.env[name];
        sources[name] = isUsableValue(envValue) ? envValue : defaultUrl;
    }

    for (const [name, value] of Object.entries(process.env)) {
        if (!name.includes('OPENAPI') || name in DEFAULT_URLS) {
            continue;
        }

        if (isUsableValue(value)) {
            sources[name] = value;
        }
    }

    return sources;
};

// Fetch with retry
const fetchWithRetry = async (targetUrl, retries = RETRY_ATTEMPTS) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(targetUrl);
            if (response.ok) return response;

            if (attempt === retries) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            if (attempt === retries) throw err;
        }

        const delay = Math.pow(2, attempt) * RETRY_BASE_DELAY_MS;
        console.warn(`Attempt ${attempt}/${retries} failed, retrying in ${delay}ms…`);
        await new Promise((r) => setTimeout(r, delay));
    }
};

// Remove nullable: true from spec
const removeNullableTrue = (obj) => {
    let count = 0;

    const walk = (node) => {
        if (Array.isArray(node)) {
            node.forEach(walk);
        } else if (typeof node === 'object' && node !== null) {
            for (const k in node) {
                if (k === 'nullable' && node[k] === true) {
                    delete node[k];
                    count++;
                } else {
                    walk(node[k]);
                }
            }
        }
    };

    walk(obj);
    return count;
};

// Fetch, clean, and persist spec
const fetchAndClean = async (name, sourceUrl) => {
    console.log(`[${name}] Fetching spec from ${sourceUrl}`);

    let rawData;
    if (sourceUrl.startsWith('http')) {
        const response = await fetchWithRetry(sourceUrl);
        rawData = await response.text();
    } else {
        rawData = fs.readFileSync(sourceUrl, 'utf-8');
    }

    const jsonData = JSON.parse(rawData);
    const removedCount = removeNullableTrue(jsonData);

    console.log(`[${name}] Cleaned spec: removed ${removedCount} "nullable: true" field${removedCount !== 1 ? 's' : ''}`);

    const outDir = './generated';
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // Derive output filename from env var name: substring after "OPENAPI_".
    // Strip a trailing "_url" or "url" and fallback to "core" when empty.
    const marker = 'OPENAPI_';
    const markerIndex = name.indexOf(marker);
    const rawSuffix = markerIndex >= 0 ? name.substring(markerIndex + marker.length) : '';
    const suffix = rawSuffix.replace(/_?url$/i, '');
    const baseName = suffix.trim() === '' ? 'core' : suffix.toLowerCase();

    const outFilePath = path.join(outDir, `${baseName}.json`);
    fs.writeFileSync(outFilePath, JSON.stringify(jsonData, null, 2));

    return outFilePath;
};

const sources = resolveSources();

for (const [name, sourceUrl] of Object.entries(sources)) {
    try {
        const localFilePath = await fetchAndClean(name, sourceUrl);
        console.log(`[${name}] | ${environmentName} | Saved cleaned spec to ${localFilePath}`);
    } catch (err) {
        console.warn(`[${name}] Warning: failed to download/clean spec: ${err?.message ?? err}`);
        // continue with next source without exiting
    }
}
