var CopyWebpackPlugin = require('copy-webpack-plugin');
var DefinePlugin = require('webpack').DefinePlugin;


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
          { from: './assets', to: 'dist/vendor/bpmn-js-token-simulation/assets' },
          { from: 'bpmn-js/dist/assets', context: 'node_modules', to: 'dist/vendor/bpmn-js/assets' },
          { from: 'bpmn-js-properties-panel/dist/assets', context: 'node_modules', to: 'dist/vendor/bpmn-js-properties-panel/assets' }
        ]
      }),
      new DefinePlugin({
        'process.env.TOKEN_SIMULATION_VERSION': JSON.stringify(require('./package.json').version)
      })
    ],
    devtool
  };

};