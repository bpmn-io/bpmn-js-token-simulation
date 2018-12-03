'use strict';

var tryCatchAll = require('../../util/TryCatchUtil').tryCatchAll;

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

var HIGH_PRIORITY = 10001;

function DisableModeling(
    contextPad,
    directEditing,
    dragging,
    editorActions,
    eventBus,
    modeling,
    palette) {
  var self = this;

  this._eventBus = eventBus;

  this.modelingDisabled = false;

  eventBus.on(TOGGLE_MODE_EVENT, HIGH_PRIORITY, function(context) {
    var simulationModeActive = context.simulationModeActive;

    self.modelingDisabled = simulationModeActive;

    if (self.modelingDisabled) {
      directEditing.cancel();
      contextPad.close();
      dragging.cancel();
    }

    palette._update();
  });

  function intercept(obj, fnName, cb) {
    var fn = obj[fnName];
    obj[fnName] = function() {
      return cb.call(this, fn, arguments);
    };
  }

  function ignoreIfModelingDisabled(obj, fnName) {
    intercept(obj, fnName, function(fn, args) {
      if (self.modelingDisabled) {
        return;
      }

      return fn.apply(this, args);
    });
  }

  function throwIfModelingDisabled(obj, fnName) {
    intercept(obj, fnName, function(fn, args) {
      if (self.modelingDisabled) {
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
    var action = args[0];

    if (self.modelingDisabled && isAnyAction([
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
  'contextPad',
  'directEditing',
  'dragging',
  'editorActions',
  'eventBus',
  'modeling',
  'palette'
];

module.exports = tryCatchAll(DisableModeling);

// helpers //////////

function isAnyAction(actions, action) {
  return actions.indexOf(action) > -1;
}