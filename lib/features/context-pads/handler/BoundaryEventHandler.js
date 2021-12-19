import {
  PlayIcon
} from '../../../icons';


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

  const html = `
    <div class="context-pad" title="Trigger Event">
      ${PlayIcon()}
    </div>
  `;

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