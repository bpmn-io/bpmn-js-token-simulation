import {
  domify
} from 'min-dom';

import {
  is
} from '../../../util/ElementHelper';


export default function BoundaryEventHandler(simulator) {
  this._simulator = simulator;
}

BoundaryEventHandler.prototype.createContextPads = function(element) {
  return element.attachers.map(
    attacher => this.createBoundaryContextPad(attacher)
  );
};

BoundaryEventHandler.prototype.createBoundaryContextPad = function(element) {

  const scopeElement = element.host;

  const relatedScopes =
    is(scopeElement, 'bpmn:SubProcess')
      ? this._findScopes({ element: scopeElement })
      : this._findScopes({ waitsOnElement: scopeElement });

  if (!relatedScopes.length) {
    return;
  }

  const html = domify(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  // TODO(nikku): do not show on compenstation boundary

  const scopes = () => {
    return this._findScopes({
      element: element.parent,
      waitsOnElement: scopeElement
    });
  };

  const action = (scopes) => {

    return this._simulator.signal({
      element: element,
      scope: scopes[0]
    });
  };

  return {
    action,
    element,
    html,
    scopes
  };
};

BoundaryEventHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

BoundaryEventHandler.$inject = [
  'simulator'
];