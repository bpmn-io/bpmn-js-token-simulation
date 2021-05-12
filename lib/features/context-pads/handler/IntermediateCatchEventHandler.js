import {
  domify,
  event as domEvent
} from 'min-dom';


export default function IntermeditateCatchEventHandler(
    simulator,
    scopeFilter) {

  this._simulator = simulator;
  this._scopeFilter = scopeFilter;
}

IntermeditateCatchEventHandler.prototype.createContextPads = function(element) {

  // TODO(nikku): implement event-based gateway logic

  const activeScope = this._findScope({
    waitsOnElement: element
  });

  if (!activeScope) {
    return [];
  }

  const html = domify(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  domEvent.bind(html, 'click', () => {
    this._simulator.signal({
      element,
      scope: this._findScope({
        waitsOnElement: element
      })
    });
  });

  return [
    {
      element,
      html
    }
  ];
};

IntermeditateCatchEventHandler.prototype._findScope = function(options) {
  return (
    this._scopeFilter.findScope(options) ||
    this._simulator.findScope(options)
  );
};

IntermeditateCatchEventHandler.$inject = [
  'simulator',
  'scopeFilter'
];