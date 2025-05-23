import js from '@eslint/js'
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'
import json from '@eslint/json'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactCompiler from 'eslint-plugin-react-compiler'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginJest from 'eslint-plugin-jest'

export default defineConfig([
  globalIgnores([
    '**/.lamassu',
    '**/build',
    '**/package.json',
    '**/package-lock.json',
    '**/currencies.json',
    '**/countries.json',
    '**/languages.json',
  ]),
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['packages/admin-ui/**/*.{js,mjs,jsx}'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
        process: 'readonly',
      },
    },
  },
  {
    files: ['packages/server/**/*.{js,cjs}'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
  {
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
    files: ['packages/admin-ui/**/*.{jsx,js}'],
  },
  { ...reactCompiler.configs.recommended },
  eslintConfigPrettier,
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    rules: {
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react-compiler/react-compiler': 'warn',
    },
  },
  {
    // update this to match your test files
    files: ['**/*.spec.js', '**/*.test.js'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
])
