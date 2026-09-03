import { replaceInFile } from 'replace-in-file';

const options = {
  files: 'generated/core/zod-schema.ts',
  from: /datetime\(\)/g,
  to: 'datetime({local: true})'
};

try {
  await replaceInFile(options);
} catch (error) {
  console.error('Errore nella sostituzione datetime:', error);
}
