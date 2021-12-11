import {
  domify
} from 'min-dom';


export default function ContinueHandler(simulator, stepper) {
  this._simulator = simulator;
  this._stepper = stepper;
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

  const action = (scopes, event) => {

    const step = event.ctrlKey || event.metaKey;

    const scope = scopes[0];

    if (step) {
      this._stepper.install(scope.parent);
    }

    this._simulator.signal({
      element,
      scope
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
  'simulator',
  'stepper'
];