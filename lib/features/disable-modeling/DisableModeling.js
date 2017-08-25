'use strict';

var forEach = require('lodash/forEach');

var events = require('../../util/EventHelper'),
    TOGGLE_MODE_EVENT = events.TOGGLE_MODE_EVENT;

var HIGH_PRIORITY = 10001;

function DisableModeling(
  eventBus,
  contextPad,
  dragging,
  directEditing,
  editorActions,
  modeling,
  palette,
  paletteProvider) {
    var self = this;

    this._eventBus = eventBus;

    this.modelingDisabled = false;

    eventBus.on(TOGGLE_MODE_EVENT, HIGH_PRIORITY, function (context) {
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
      obj[fnName] = function () {
        return cb.call(this, fn, arguments);
      };
    }

    function ignoreIfModelingDisabled(obj, fnName) {
      intercept(obj, fnName, function (fn, args) {
        if (self.modelingDisabled) {
          return;
        }

        return fn.apply(this, args);
      });
    }

    function throwIfModelingDisabled(obj, fnName) {
      intercept(obj, fnName, function (fn, args) {
        if (self.modelingDisabled) {
          throw new Error('model is read-only');
        }

        return fn.apply(this, args);
      });
    }

    ignoreIfModelingDisabled(contextPad, 'open');

    ignoreIfModelingDisabled(dragging, 'init');

    ignoreIfModelingDisabled(directEditing, 'activate');

    ignoreIfModelingDisabled(editorActions._actions, 'undo');
    ignoreIfModelingDisabled(editorActions._actions, 'redo');
    ignoreIfModelingDisabled(editorActions._actions, 'copy');
    ignoreIfModelingDisabled(editorActions._actions, 'paste');
    ignoreIfModelingDisabled(editorActions._actions, 'removeSelection');
    ignoreIfModelingDisabled(editorActions._actions, 'spaceTool');
    ignoreIfModelingDisabled(editorActions._actions, 'lassoTool');
    ignoreIfModelingDisabled(editorActions._actions, 'globalConnectTool');
    ignoreIfModelingDisabled(editorActions._actions, 'distributeElements');
    ignoreIfModelingDisabled(editorActions._actions, 'alignElements');
    ignoreIfModelingDisabled(editorActions._actions, 'directEditing');

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

module.exports = DisableModeling;