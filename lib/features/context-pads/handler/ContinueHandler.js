import {
  PlayIcon
} from '../../../icons';


export default function ContinueHandler(simulator) {
  this._simulator = simulator;
}

ContinueHandler.prototype.createContextPads = function(element) {

  const scopes = () => this._findScopes(scope => {
    return (
      !scope.destroyed &&
      scope.element === element &&
      !scope.children.length
    );
  });

  const html = `
    <div class="bts-context-pad" title="Trigger Event">
      ${ PlayIcon() }
    </div>
  `;

  const action = (scopes) => {
    this._simulator.signal({
      element,
      scope: scopes[0]
    });
  };

  return [
    {
      action,
      element,
      html,
      scopes
    }
  ];
};

ContinueHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

ContinueHandler.$inject = [
  'simulator'
];