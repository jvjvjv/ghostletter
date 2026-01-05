import importPlugin from 'eslint-plugin-import';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

import tsParser from '@typescript-eslint/parser';

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/eslint.config.*',
      '**/postcss.config.*',
      '**/prettier.config.*',
      '**/tailwind.config.*',
    ],
  },
  {
    "overrides": [
      {
        "files": ["**/*.test.ts", "**/*.spec.ts"],
        "rules": {
          "@typescript-eslint/unbound-method": "off"
        }
      }
    ]
  },
  // JS/Next.js config
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    plugins: {
      import: importPlugin,
      next: nextPlugin,
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...nextPlugin.configs['recommended'].rules,
      ...importPlugin.configs['recommended'].rules,
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/consistent-type-specifier-style': ['error', 'porfer-top-level'],
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',
      'no-console': [
        'warn',
        { allow: ['warn', 'error', 'debug'] },
      ],
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  // TypeScript config
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      import: importPlugin,
      '@typescript-eslint': tsPlugin,
      next: nextPlugin,
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...nextPlugin.configs['recommended'].rules,
      ...importPlugin.configs['recommended'].rules,
      ...importPlugin.configs['typescript'].rules,
      ...tsPlugin.configs['recommended-type-checked'].rules,
      '@typescript-eslint/array-type': [
        'error',
        { default: 'generic' },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/method-signature-style': [
        'error',
        'property',
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-parameters': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          args: 'after-used',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',
      'no-console': [
        'warn',
        { allow: ['warn', 'error', 'debug'] },
      ],
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: process.cwd(),
        projectService: true,
      },
    },
  },
];

export default eslintConfig;
