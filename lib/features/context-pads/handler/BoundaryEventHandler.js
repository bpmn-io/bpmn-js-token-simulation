import {
  domify,
  event as domEvent
} from 'min-dom';

import {
  is
} from '../../../util/ElementHelper';

export default function BoundaryEventHandler(simulator, scopeFilter) {
  this._simulator = simulator;
  this._scopeFilter = scopeFilter;
}

BoundaryEventHandler.prototype.createContextPads = function(element) {

  if (is(element, 'bpmn:BoundaryEvent')) {
    return [
      this.createBoundaryContextPad(element)
    ];
  }

  if (is(element, 'bpmn:SubProcess')) {
    return element.attachers.map(
      attacher => this.createBoundaryContextPad(attacher)
    );
  }
};

BoundaryEventHandler.prototype.createBoundaryContextPad = function(boundaryElement) {

  const scopeElement = boundaryElement.host;

  const nestedScope = this._findScope({
    element: scopeElement
  });

  if (!nestedScope) {
    return;
  }

  const html = domify(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  // TODO(nikku): do not show on compenstation boundary

  domEvent.bind(html, 'click', () => {
    this._simulator.signal({
      element: boundaryElement,
      scope: this._findScope({
        element: boundaryElement.parent,
        waitsOnElement: scopeElement
      })
    });
  });

  return {
    element: boundaryElement,
    html
  };
};

BoundaryEventHandler.prototype._findScope = function(options) {
  return (
    this._scopeFilter.findScope(options) ||
    this._simulator.findScope(options)
  );
};

BoundaryEventHandler.$inject = [
  'simulator',
  'scopeFilter'
];