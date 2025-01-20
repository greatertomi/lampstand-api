import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: ['**/commitlint.config.js', '**/dist/', '**/jest.config.ts', '**/eslint.config.mjs']
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript',
    'plugin:unicorn/recommended',
    'plugin:sonarjs/recommended'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      unicorn,
      sonarjs
    },
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json', './test/tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module'
      }
    },
    rules: {
      'unicorn/filename-case': 'off',
      'import/prefer-default-export': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'no-console': 'error',
      'no-restricted-syntax': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/lines-between-class-members': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'no-underscore-dangle': 'off',
      'spaced-comment': 'off',
      'import/extensions': 'off',
      'comma-dangle': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      'react/jsx-filename-extension': 'off',
      indent: 'off',
      '@typescript-eslint/indent': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'no-duplicate-imports': 'error'
    }
  }
];
