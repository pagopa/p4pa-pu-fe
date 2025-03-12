import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
// TODO: add 'eslint-plugin-react-hooks'

export default tseslint.config([
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  prettier,
  sonarjs.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: ['dist/', 'coverage/', 'generated/']
  },
  {
    settings: {
      react: { version: 'detect' }
    },
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      'no-multi-spaces': ['error'],
      'react-refresh/only-export-components': [
        'off',
        { allowConstantExport: true }
      ],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
      '@typescript-eslint/array-type': ['warn', { default: 'generic' }],
      'sonarjs/assertions-in-tests': 'off',
      'sonarjs/todo-tag': 'warn'
    }
  },
  {
    files: ['*.mjs', '*.cjs', '*.js?(x)'],
    ...tseslint.configs.disableTypeChecked
  },
  {
    files: ['**/*.test.ts?(x)'],
    rules: {
      'sonarjs/no-clear-text-protocols': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
]);
