module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'no-console': ['error'],
    'import/extensions': [0],
    'import/no-unresolved': [0],
    'import/no-extraneous-dependencies': [0],
    semi: [2, 'never'],
    'import/prefer-default-export': [0],
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/no-var-requires': [0],
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/no-non-null-assertion': [0],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-empty-function': ['error'],

    'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: ['return', 'if', 'switch'] }],
  },
  overrides: [
    {
      files: ['src/domain/repositories/types/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 0,
        'padding-line-between-statements': 0,
      },
    },
    {
      files: ['./jest.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-unused-vars': 0,
      },
    },
  ],
  settings: {},
}
