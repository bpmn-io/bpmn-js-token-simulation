import {
  domify,
  event as domEvent
} from 'min-dom';

import {
  is
} from '../../../util/ElementHelper';


export default function StartEventHandler(simulator) {
  this._simulator = simulator;
}

StartEventHandler.prototype.createContextPads = function(element) {

  if (is(element.parent, 'bpmn:SubProcess')) {
    return;
  }

  const html = domify(
    '<div class="context-pad"><i class="fa fa-play"></i></div>'
  );

  domEvent.bind(html, 'click', () => {
    this._simulator.signal({
      element
    });
  });

  return [
    {
      element,
      html
    }
  ];
};

StartEventHandler.$inject = [
  'simulator'
];