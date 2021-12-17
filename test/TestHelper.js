export * from 'bpmn-js/test/helper';

import {
  insertCSS
} from 'bpmn-js/test/helper';


export function injectStyles() {

  insertCSS('bpmn-js-token-simulation.css', require('../assets/css/bpmn-js-token-simulation.css'));

  insertCSS('diagram-js.css', require('bpmn-js/dist/assets/diagram-js.css'));

  insertCSS('bpmn-font.css', require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'));

  insertCSS('diagram-js-testing.css',
    'body .test-container { height: auto }' +
    'body .test-container .test-content-container { height: 90vmin; }'
  );
}