import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  ignored: [
    'example/dist',
    'lib/icons/index.js',
    'tmp'
  ],
  build: [
    '*.js',
    '*.mjs',
    'tasks',
    'test/reporters/fixture-reporter.js'
  ],
  test: [
    '**/test/**/*.js'
  ]
};

export default [
  {
    ignores: files.ignored
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {
    return {
      ...config,
      files: files.build
    };
  }),

  // lib + test
  ...bpmnIoPlugin.configs.browser.map(config => {
    return {
      ...config,
      ignores: files.build
    };
  }),

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {
    return {
      ...config,
      files: files.test,
      ignores: files.build
    };
  }),
  {
    languageOptions: {
      globals: {
        sinon: true,
        require: true
      }
    },
    files: files.test
  },

  // misc
  // ignore first level indent in template literals
  {
    rules: {
      indent: [ 2, 2, {
        VariableDeclarator: { 'var': 2, 'let': 2, 'const': 3 },
        FunctionDeclaration: { 'body': 1, 'parameters': 2 },
        FunctionExpression: { 'body': 1, 'parameters': 2 },
        ignoredNodes: [ 'TemplateLiteral > *' ]
      } ]
    }
  }
];
