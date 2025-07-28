import js from '@eslint/js'
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'
import json from '@eslint/json'
import { defineConfig, globalIgnores } from 'eslint/config'
import ts from 'typescript-eslint'
import reactCompiler from 'eslint-plugin-react-compiler'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import vitest from 'eslint-plugin-vitest'

const jsConfig = defineConfig([
  globalIgnores([
    '**/.lamassu',
    '**/build',
    '**/package.json',
    '**/package-lock.json',
    '**/currencies.json',
    '**/countries.json',
    '**/languages.json',
    'packages/typesafe-db/lib/**/*.js'
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
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
      'vitest/max-nested-describe': ['error', { max: 3 }], // you can also modify rules' behavior using option like this
    },
  },
])

export default ts.config(
  jsConfig,
  {
    files: ['packages/typesafe-db/src/**/*.ts'],
    extends: [ts.configs.recommended],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // TODO: remove this line
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
)
