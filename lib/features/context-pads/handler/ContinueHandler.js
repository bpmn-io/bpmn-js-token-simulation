import {
  domify
} from 'min-dom';


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

  if (!scopes().length) {
    return;
  }

  const html = domify(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

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