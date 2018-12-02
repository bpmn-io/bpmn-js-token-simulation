export * from 'bpmn-js/test/helper';

import {
  insertCSS
} from 'bpmn-js/test/helper';

insertCSS('bpmn-js-token-simulation.css', require('assets/css/bpmn-js-token-simulation.css'));
insertCSS('normalize.css', require('assets/css/normalize.css'));
insertCSS('font-awesome.css', require('assets/css/font-awesome.min.css'));

insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

insertCSS('bpmn-embedded.css', require('bpmn-font/dist/css/bpmn-embedded.css'));

insertCSS('diagram-js-testing.css',
  'body .test-container { height: auto }' +
  'body .test-container .test-content-container { height: 90vmin; }'
);