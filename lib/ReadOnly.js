'use strict';

var forEach = require('lodash/forEach');

var HIGH_PRIORITY = 10001;

function ReadOnly(
  eventBus,
  contextPad,
  dragging,
  directEditing,
  editorActions,
  modeling,
  palette,
  paletteProvider) {

    this._readOnly = false;
    this._eventBus = eventBus;

    var self = this;

    eventBus.on('tokenSimulation.switchMode', HIGH_PRIORITY, function (context) {
      var mode = context.mode;

      self._readOnly = mode === 'simulation';

      if (self._readOnly) {
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

    function ignoreWhenReadOnly(obj, fnName) {
      intercept(obj, fnName, function (fn, args) {
        if (self._readOnly) {
          return;
        }

        return fn.apply(this, args);
      });
    }

    function throwIfReadOnly(obj, fnName) {
      intercept(obj, fnName, function (fn, args) {
        if (self._readOnly) {
          throw new Error('model is read-only');
        }

        return fn.apply(this, args);
      });
    }

    ignoreWhenReadOnly(contextPad, 'open');

    ignoreWhenReadOnly(dragging, 'init');

    ignoreWhenReadOnly(directEditing, 'activate');

    ignoreWhenReadOnly(editorActions._actions, 'undo');
    ignoreWhenReadOnly(editorActions._actions, 'redo');
    ignoreWhenReadOnly(editorActions._actions, 'copy');
    ignoreWhenReadOnly(editorActions._actions, 'paste');
    ignoreWhenReadOnly(editorActions._actions, 'removeSelection');
    // BpmnEditorActions
    ignoreWhenReadOnly(editorActions._actions, 'spaceTool');
    ignoreWhenReadOnly(editorActions._actions, 'lassoTool');
    ignoreWhenReadOnly(editorActions._actions, 'globalConnectTool');
    ignoreWhenReadOnly(editorActions._actions, 'distributeElements');
    ignoreWhenReadOnly(editorActions._actions, 'alignElements');
    ignoreWhenReadOnly(editorActions._actions, 'directEditing');

    throwIfReadOnly(modeling, 'moveShape');
    throwIfReadOnly(modeling, 'updateAttachment');
    throwIfReadOnly(modeling, 'moveElements');
    throwIfReadOnly(modeling, 'moveConnection');
    throwIfReadOnly(modeling, 'layoutConnection');
    throwIfReadOnly(modeling, 'createConnection');
    throwIfReadOnly(modeling, 'createShape');
    throwIfReadOnly(modeling, 'createLabel');
    throwIfReadOnly(modeling, 'appendShape');
    throwIfReadOnly(modeling, 'removeElements');
    throwIfReadOnly(modeling, 'distributeElements');
    throwIfReadOnly(modeling, 'removeShape');
    throwIfReadOnly(modeling, 'removeConnection');
    throwIfReadOnly(modeling, 'replaceShape');
    throwIfReadOnly(modeling, 'pasteElements');
    throwIfReadOnly(modeling, 'alignElements');
    throwIfReadOnly(modeling, 'resizeShape');
    throwIfReadOnly(modeling, 'createSpace');
    throwIfReadOnly(modeling, 'updateWaypoints');
    throwIfReadOnly(modeling, 'reconnectStart');
    throwIfReadOnly(modeling, 'reconnectEnd');

    // intercept(paletteProvider, 'getPaletteEntries', function (fn, args) {
    //   var entries = fn.apply(this, args);
    //   if (self._readOnly) {
    //     var allowedEntries = [
    //       'hand-tool'
    //     ];

    //     forEach(entries, function (value, key) {
    //       if (allowedEntries.indexOf(key) === -1) {
    //         delete entries[key];
    //       }
    //     });
    //   }
    //   return entries;
    // });
}

ReadOnly.$inject = [
  'eventBus',
  'contextPad',
  'dragging',
  'directEditing',
  'editorActions',
  'modeling',
  'palette',
  'paletteProvider',
];

module.exports = ReadOnly;

ReadOnly.prototype.readOnly = function (readOnly) {
  var newValue = !!readOnly,
      oldValue = !!this._readOnly;

  if (readOnly === undefined || newValue === oldValue) {
    return oldValue;
  }

  this._readOnly = newValue;
  this._eventBus.fire('readOnly.changed', { readOnly: newValue });
  return newValue;
};