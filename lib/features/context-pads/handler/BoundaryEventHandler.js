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
  return element.attachers.map(
    attacher => this.createBoundaryContextPad(attacher)
  );
};

BoundaryEventHandler.prototype.createBoundaryContextPad = function(element) {

  const scopeElement = element.host;

  if (is(scopeElement, 'bpmn:SubProcess')) {

    // need nested running scopes on sub-processes
    const nestedScope = this._findScope({
      element: scopeElement
    });

    if (!nestedScope) {
      return;
    }
  } else {

    // need waiting scope on other elements
    const waitingScope = this._findScope({
      waitsOnElement: scopeElement
    });

    if (!waitingScope) {
      return;
    }
  }

  const html = domify(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  // TODO(nikku): do not show on compenstation boundary

  domEvent.bind(html, 'click', () => {
    this._simulator.signal({
      element: element,
      scope: this._findScope({
        element: element.parent,
        waitsOnElement: scopeElement
      })
    });
  });

  return {
    element,
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