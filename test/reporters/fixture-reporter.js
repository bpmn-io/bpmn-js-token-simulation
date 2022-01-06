const fs = require('fs');

function FixtureReporter(baseReporterDecorator, config, logger, helper, formatError) {
  const log = logger.create('reporter.fixture');

  let errors = false;

  baseReporterDecorator(this);

  this.adapters = [
    function(msg) {
    }
  ];

  this.onRunStart = function(browsers) { };

  this.onBrowserStart = function(browser) { };

  this.onBrowserComplete = function(browser) { };

  this.onRunComplete = function() {

    if (errors && !process.env.GENERATE_FIXTURES) {
      log.info('re-run with GENERATE_FIXTURES=1 to re-generate specs');
    }

    errors = false;
  };

  this.specSuccess = this.specSkipped = this.specFailure = function(browser, result) {

    if (result.success || result.suite[0] !== 'simulator') {
      return;
    }

    // re-generate fixtures
    if (result.assertionErrors.length) {

      const error = result.assertionErrors[0];

      const match = /expected trace <([^>]+)>/.exec(error.message);

      if (match) {
        const traceFile = `test/spec/simulator/Simulator.${match[1]}.json`;

        errors = true;

        if (process.env.GENERATE_FIXTURES) {
          log.info('updating fixture', traceFile);

          const json = error.actual.replace(/"\n(\s+)"/g, '",\n$1"');

          fs.writeFileSync(traceFile, json, 'utf8');
        }

        return;
      }
    }

    // generate initial fixtures
    const error = result.log[0];

    const match = /Cannot find module '\.\/Simulator\.([^.]*)\.json'/.exec(error);

    if (match) {
      const traceFile = `test/spec/simulator/Simulator.${match[1]}.json`;

      log.info('creating fixture', traceFile);

      fs.writeFileSync(traceFile, '[]', 'utf8');
    }
  };

  this.onExit = function(done) {
    done();
  };
}

FixtureReporter.$inject = [
  'baseReporterDecorator',
  'config',
  'logger',
  'helper',
  'formatError'
];

module.exports = {
  'reporter:fixture': [ 'type', FixtureReporter ]
};