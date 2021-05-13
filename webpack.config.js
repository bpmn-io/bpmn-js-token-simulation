var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {

  const mode = argv.mode || 'development';

  const config = {
    mode,
    entry: {
      viewer: './example/src/viewer.js',
      modeler: './example/src/modeler.js'
    },
    output: {
      filename: 'dist/[name].js',
      path: __dirname + '/example'
    },
    module: {
      rules: [
        {
          test: /\.bpmn$/,
          use: {
            loader: 'raw-loader'
          }
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: './node_modules/bpmn-js/dist/assets', to: 'dist/vendor/bpmn-js/assets' },
          { from: './assets', to: 'dist/vendor/bpmn-js-token-simulation/assets' }
        ]
      })
    ]
  };

  if (mode === 'production') {
    config.devtool = 'source-map';
  }

  return config;
};