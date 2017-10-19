module.exports = {
  extends: ['algolia/react', 'algolia/jest', 'algolia'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/no-commonjs': 'off',
    'react/prop-types': 'off',
    'react/jsx-key': 'off',
    'react/no-unknown-property': 'off',
  },
};
