import {
  domify
} from 'min-dom';


export default function BoundaryEventHandler(simulator) {
  this._simulator = simulator;
}

BoundaryEventHandler.prototype.createContextPads = function(element) {
  return element.attachers.map(
    attacher => this.createBoundaryContextPad(attacher)
  );
};

BoundaryEventHandler.prototype.createBoundaryContextPad = function(element) {

  const scopes = () => {
    return this._findScopes({
      element: element.host
    });
  };

  if (!scopes().length) {
    return;
  }

  const html = domify(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  // TODO(nikku): do not show on compenstation boundary

  const action = (scopes) => {

    return this._simulator.signal({
      element: element,
      parentScope: scopes[0].parent
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