var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {

  const mode = argv.mode || 'development';

  const devtool = mode === 'development' ? 'eval-source-map' : 'source-map';

  return {
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
          type: 'asset/source'
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
    ],
    devtool
  };

};