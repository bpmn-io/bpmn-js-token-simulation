import {
  domify,
  event as domEvent
} from 'min-dom';


export default function IntermeditateCatchEventHandler(simulator) {
  this._simulator = simulator;
}

IntermeditateCatchEventHandler.prototype.createContextPads = function(element) {

  // TODO(nikku): implement event-based gateway logic

  const activeScope = this._simulator.findScope({
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
      scope: activeScope
    });
  });

  return [
    {
      element,
      html
    }
  ];
};

IntermeditateCatchEventHandler.$inject = [
  'simulator'
];