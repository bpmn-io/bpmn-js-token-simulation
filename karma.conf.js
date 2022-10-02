/* eslint-env node */

'use strict';

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
var browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

var fixtureReporter = require('./test/reporters/fixture-reporter');

var singleStart = process.env.SINGLE_START;

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

var coverage = process.env.COVERAGE;

var path = require('path');

var absoluteBasePath = path.resolve(__dirname);

var suite = coverage ? 'test/all.js' : 'test/suite.js';


module.exports = function(karma) {

  karma.set({

    plugins: [
      'karma-*',
      fixtureReporter
    ],

    frameworks: [
      'mocha',
      'sinon-chai',
      'webpack'
    ],

    files: [
      { pattern: 'assets/**/*', included: false, served: true },
      suite
    ],

    preprocessors: {
      [suite]: [ 'webpack', 'env' ]
    },

    reporters: [ 'progress', 'fixture' ].concat(coverage ? 'coverage' : []),

    browsers: singleStart ? browsers.concat('Debug') : browsers,

    browserNoActivityTimeout: 30000,

    envPreprocessor: singleStart ? [ 'SINGLE_START' ] : [],

    coverageReporter: {
      reporters: [
        { type: 'lcov', subdir: '.' }
      ]
    },

    autoWatch: false,
    singleRun: true,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(css|bpmn)$/,
            type: 'asset/source'
          },
          {
            test: /\.png$/,
            type: 'asset/inline'
          }
        ].concat(
          coverage ? {
            test: /\.js$/,
            use: {
              loader: 'babel-loader',
              options: {
                plugins: [
                  'babel-plugin-istanbul'
                ]
              }
            },
            include: /lib\.*/,
            exclude: /node_modules/
          } : []
        )
      },
      resolve: {
        mainFields: [
          'dev:module',
          'browser',
          'module',
          'main'
        ],
        modules: [
          'node_modules',
          absoluteBasePath
        ]
      }
    }
  });
};
