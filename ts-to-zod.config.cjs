/**
 * ts-to-zod configuration.
 *
 * @type {import("ts-to-zod").TsToZodConfig}
 */
module.exports = [
  {
    name: 'api',
    input: './generated/data-contracts.ts',
    output: './generated/zod-schema.ts'
  },
  {
    name: 'fileshare',
    input: './generated/fileshare/data-contracts.ts',
    output: './generated/fileshare/zod-schema.ts'
  }
];
