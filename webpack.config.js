var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    viewer: './example/viewer.js',
    modeler: './example/modeler.js'
  },
  output: {
    filename: '[name].bundle.js',
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
    new CopyWebpackPlugin([
      { from: './node_modules/bpmn-js/dist/assets/**/*', to: '.' },
      { from: './assets/**/*', to: '.' }
    ])
  ]
};