/* eslint-disable */

/**
 * ts-to-zod configuration.
 *
 * @type {import("ts-to-zod").TsToZodConfig}
 */

const fs = require('fs');
const path = require('path');

const generatedDir = path.resolve(__dirname, 'generated');

function findDataContracts(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return findDataContracts(fullPath);
    }

    if (entry.isFile() && entry.name === 'data-contracts.ts') {
      return [fullPath];
    }

    return [];
  });
}

module.exports = findDataContracts(generatedDir).map((input) => {
  const directory = path.dirname(input);

  return {
    name: path.relative(generatedDir, directory),
    input: path.relative(process.cwd(), input),
    output: path.relative(process.cwd(), path.join(directory, 'zod-schema.ts'))
  };
});
