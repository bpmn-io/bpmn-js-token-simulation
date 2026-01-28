import TokenSimulationVisualizerModule from '../../lib/visualizer';

import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import fileDrop from 'file-drops';

import fileOpen from 'file-open';

import exampleXML from '../resources/example.bpmn';


const url = new URL(window.location.href);

const persistent = url.searchParams.has('p');
const active = url.searchParams.has('e');

const initialDiagram = (() => {
  try {
    return persistent && localStorage['diagram-xml'] || exampleXML;
  } catch (err) {
    return exampleXML;
  }
})();

const ExampleModule = {
  __init__: [
    [ 'eventBus', 'bpmnjs', 'toggleMode', 'executionVisualizer', function(eventBus, bpmnjs, toggleMode, executionVisualizer) {

      if (persistent) {
        eventBus.on('commandStack.changed', function() {
          bpmnjs.saveXML().then(result => {
            localStorage['diagram-xml'] = result.xml;
          });
        });
      }

      if ('history' in window) {
        eventBus.on('tokenSimulation.toggleMode', event => {

          if (event.active) {
            url.searchParams.set('e', '1');
          } else {
            url.searchParams.delete('e');
          }

          history.replaceState({}, document.title, url.toString());
        });
      }

      eventBus.on('diagram.init', 500, () => {
        toggleMode.toggleMode(active);
      });

      // Wire up example UI controls
      setupControls(toggleMode, executionVisualizer, eventBus);
    } ]
  ]
};

function setupControls(toggleMode, executionVisualizer, eventBus) {
  const toggleBtn = document.getElementById('toggleMode');
  const step1Btn = document.getElementById('step1');
  const step2Btn = document.getElementById('step2');
  const step3Btn = document.getElementById('step3');
  const step4Btn = document.getElementById('step4');
  const clearBtn = document.getElementById('clear');

  let modeActive = false;

  toggleBtn.addEventListener('click', () => {
    modeActive = !modeActive;
    toggleMode.toggleMode(modeActive);
    toggleBtn.textContent = modeActive ? 'Mode: ON' : 'Mode: OFF';
  });

  // Example execution steps using actual IDs from example.bpmn
  step1Btn.addEventListener('click', () => {
    if (!modeActive) {
      modeActive = true;
      toggleMode.toggleMode(modeActive);
      toggleBtn.textContent = 'Mode: ON';
    }
    executionVisualizer.setExecutionState({
      executedElements: [],
      activeElement: 'StartEvent_0j9yk1o'
    });
  });

  step2Btn.addEventListener('click', () => {
    if (!modeActive) {
      modeActive = true;
      toggleMode.toggleMode(modeActive);
      toggleBtn.textContent = 'Mode: ON';
    }
    executionVisualizer.setExecutionState({
      executedElements: ['StartEvent_0j9yk1o', 'SequenceFlow_1bpznq3'],
      activeElement: 'ParallelGateway_0s75uad'
    });
  });

  step3Btn.addEventListener('click', () => {
    if (!modeActive) {
      modeActive = true;
      toggleMode.toggleMode(modeActive);
      toggleBtn.textContent = 'Mode: ON';
    }
    executionVisualizer.setExecutionState({
      executedElements: ['StartEvent_0j9yk1o', 'SequenceFlow_1bpznq3', 'ParallelGateway_0s75uad', 'SequenceFlow_10d6h3a'],
      activeElement: 'Task_1upmjgh'
    });
  });

  step4Btn.addEventListener('click', () => {
    if (!modeActive) {
      modeActive = true;
      toggleMode.toggleMode(modeActive);
      toggleBtn.textContent = 'Mode: ON';
    }
    executionVisualizer.setExecutionState({
      executedElements: ['StartEvent_0j9yk1o', 'SequenceFlow_1bpznq3', 'ParallelGateway_0s75uad', 'SequenceFlow_10d6h3a', 'Task_1upmjgh', 'SequenceFlow_1dzm18n'],
      activeElement: 'ParallelGateway_158jo5x'
    });
  });

  clearBtn.addEventListener('click', () => {
    executionVisualizer.clear();
  });
}

const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    ExampleModule,
    TokenSimulationVisualizerModule
  ]
});

function openDiagram(diagram) {
  return viewer.importXML(diagram)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      if (persistent) {
        localStorage['diagram-xml'] = diagram;
      }

      viewer.get('canvas').zoom('fit-viewport');
    })
    .catch(err => {
      console.error(err);
    });
}

function openFile(files) {
  if (!files.length) {
    return;
  }

  const file = files[0];

  const reader = new FileReader();

  reader.onload = function(e) {
    const xml = e.target.result;

    openDiagram(xml);
  };

  reader.readAsText(file);
}

fileDrop('Drop a BPMN diagram', function(files) {
  openFile(files);
});

document.querySelector('#canvas').addEventListener('dragover', hideDropMessage);

function hideDropMessage() {
  const dropMessage = document.querySelector('.drop-message');

  if (dropMessage) {
    dropMessage.style.display = 'none';
  }

  document.querySelector('#canvas').removeEventListener('dragover', hideDropMessage);
}

openDiagram(initialDiagram);

// open on click
document.body.addEventListener('click', event => {

  // we only react if clicked in a non-input area
  if (!event.target.closest('.djs-palette, input, textarea, button, select, a')) {
    fileOpen(openFile, {
      accept: '.bpmn',
      multiple: false
    });
  }
});

// expose to window for external access
window.bpmnViewer = viewer;
