module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended',
    'airbnb-base/legacy',
    '@react-native-community',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier', 'import'],

  rules: {
    'react-native/no-unused-styles': 2,
    'no-unused-vars': [2, { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
    'react-native/no-single-element-style-arrays': 2,
    'react/jsx-no-bind': 2,
    'react/require-optimization': 2,
    'react-native/no-inline-styles': 2,

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-one-expression-per-line': 0,
    'react/destructuring-assignment': 0,
    'react/prop-types': 0,
    'no-underscore-dangle': 'off',
    'no-console': 'off',
    'import/no-extraneous-dependencies': 'off',
    strict: 0,
    'quote-props': [1, 'as-needed'],
    'no-class-assign': 0,
    'import/no-useless-path-segments': 0,
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
  env: {
    'react-native/react-native': true,
    'react/require-optimization': 2,
  },
};
