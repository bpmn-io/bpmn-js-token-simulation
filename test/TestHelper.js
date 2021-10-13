export * from 'bpmn-js/test/helper';

import {
  insertCSS
} from 'bpmn-js/test/helper';

import semver from 'semver';


export function injectStyles() {

  insertCSS('diagram-js.css', require('bpmn-js/dist/assets/diagram-js.css')),

  insertCSS('bpmn-font.css', require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'));

  bpmnJsSatisfies('>= 9') && insertCSS('bpmn-js.css', require('bpmn-js/dist/assets/bpmn-js.css'));

  insertCSS('bpmn-js-token-simulation.css', require('../assets/css/bpmn-js-token-simulation.css'));

  insertCSS('diagram-js-testing.css',
    'body .test-container { height: auto }' +
    'body .test-container .test-content-container { height: 90vmin; }'
  );
}

/**
 * Execute test only if currently installed bpmn-js is of given version.
 *
 * @param {string} versionRange
 * @param {boolean} only
 */
export function withBpmnJs(versionRange, only = false) {
  if (bpmnJsSatisfies(versionRange)) {
    return only ? it.only : it;
  } else {
    return it.skip;
  }
}

function bpmnJsSatisfies(versionRange) {
  const bpmnJsVersion = require('bpmn-js/package.json').version;

  return semver.satisfies(bpmnJsVersion, versionRange, { includePrerelease: true });
}
