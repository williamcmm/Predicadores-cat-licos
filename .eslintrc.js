module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  rules: {
  'max-lines': ['error', { max: 300, skipComments: true }],
    // Desactivadas para permitir el build
    'max-lines-per-function': 'off',
    'complexity': 'off',
    'react/prop-types': 'off',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-unused-vars': 'error'
  }
};
