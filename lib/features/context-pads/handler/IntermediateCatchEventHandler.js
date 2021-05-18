import {
  domify
} from 'min-dom';


export default function IntermeditateCatchEventHandler(simulator) {
  this._simulator = simulator;
}

IntermeditateCatchEventHandler.prototype.createContextPads = function(element) {

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

IntermeditateCatchEventHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

IntermeditateCatchEventHandler.$inject = [
  'simulator'
];