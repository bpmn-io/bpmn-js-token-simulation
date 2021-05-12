var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
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