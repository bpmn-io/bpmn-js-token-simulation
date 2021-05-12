import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const HIGH_PRIORITY = 10001;


export default function DisableModeling(
    eventBus,
    contextPad,
    dragging,
    directEditing,
    editorActions,
    modeling,
    palette,
    paletteProvider) {

  let modelingDisabled = false;

  eventBus.on(TOGGLE_MODE_EVENT, HIGH_PRIORITY, event => {

    modelingDisabled = event.active;

    if (modelingDisabled) {
      directEditing.cancel();
      contextPad.close();
      dragging.cancel();
    }

    palette._update();
  });

  function intercept(obj, fnName, cb) {
    const fn = obj[fnName];
    obj[fnName] = function() {
      return cb.call(this, fn, arguments);
    };
  }

  function ignoreIfModelingDisabled(obj, fnName) {
    intercept(obj, fnName, function(fn, args) {
      if (modelingDisabled) {
        return;
      }

      return fn.apply(this, args);
    });
  }

  function throwIfModelingDisabled(obj, fnName) {
    intercept(obj, fnName, function(fn, args) {
      if (modelingDisabled) {
        throw new Error('model is read-only');
      }

      return fn.apply(this, args);
    });
  }

  ignoreIfModelingDisabled(contextPad, 'open');

  ignoreIfModelingDisabled(dragging, 'init');

  ignoreIfModelingDisabled(directEditing, 'activate');

  ignoreIfModelingDisabled(dragging, 'init');

  ignoreIfModelingDisabled(directEditing, 'activate');

  throwIfModelingDisabled(modeling, 'moveShape');
  throwIfModelingDisabled(modeling, 'updateAttachment');
  throwIfModelingDisabled(modeling, 'moveElements');
  throwIfModelingDisabled(modeling, 'moveConnection');
  throwIfModelingDisabled(modeling, 'layoutConnection');
  throwIfModelingDisabled(modeling, 'createConnection');
  throwIfModelingDisabled(modeling, 'createShape');
  throwIfModelingDisabled(modeling, 'createLabel');
  throwIfModelingDisabled(modeling, 'appendShape');
  throwIfModelingDisabled(modeling, 'removeElements');
  throwIfModelingDisabled(modeling, 'distributeElements');
  throwIfModelingDisabled(modeling, 'removeShape');
  throwIfModelingDisabled(modeling, 'removeConnection');
  throwIfModelingDisabled(modeling, 'replaceShape');
  throwIfModelingDisabled(modeling, 'pasteElements');
  throwIfModelingDisabled(modeling, 'alignElements');
  throwIfModelingDisabled(modeling, 'resizeShape');
  throwIfModelingDisabled(modeling, 'createSpace');
  throwIfModelingDisabled(modeling, 'updateWaypoints');
  throwIfModelingDisabled(modeling, 'reconnectStart');
  throwIfModelingDisabled(modeling, 'reconnectEnd');

  intercept(editorActions, 'trigger', function(fn, args) {
    const action = args[0];

    if (modelingDisabled && isAnyAction([
      'undo',
      'redo',
      'copy',
      'paste',
      'removeSelection',
      'spaceTool',
      'lassoTool',
      'globalConnectTool',
      'distributeElements',
      'alignElements',
      'directEditing',
    ], action)) {
      return;
    }

    return fn.apply(this, args);
  });
}

DisableModeling.$inject = [
  'eventBus',
  'contextPad',
  'dragging',
  'directEditing',
  'editorActions',
  'modeling',
  'palette',
  'paletteProvider',
];


// helpers //////////

function isAnyAction(actions, action) {
  return actions.indexOf(action) > -1;
}