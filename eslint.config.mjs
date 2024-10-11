import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

export default [
  {
    ignores: [
      'example/dist',
      'lib/icons/index.js',
      'tmp'
    ]
  },
  ...bpmnIoPlugin.configs.browser,
  ...bpmnIoPlugin.configs.node.map(config => {
    return {
      ...config,
      files: [
        'karma.conf.js',
        'webpack.config.js',
        '**/test/**/*.js'
      ]
    };
  }),
  ...bpmnIoPlugin.configs.mocha.map(config => {
    return {
      ...config,
      files: [
        '**/test/**/*.js'
      ]
    };
  }),
  {
    languageOptions: {
      globals: {
        sinon: true
      },
    },
    files: [
      '**/test/**/*.js'
    ]
  },
  {
    'rules': {
      'indent': [ 2, 2, {
        'VariableDeclarator': { 'var': 2, 'let': 2, 'const': 3 },
        'FunctionDeclaration': { 'body': 1, 'parameters': 2 },
        'FunctionExpression': { 'body': 1, 'parameters': 2 },
        'ignoredNodes': [ 'TemplateLiteral > *' ]
      } ],
      'no-bitwise': 0
    }
  }
];
