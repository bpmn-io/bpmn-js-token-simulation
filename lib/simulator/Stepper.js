import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function Stepper(simulator) {

  this.install = function(scope) {

    if (scope) {
      this.installForScope(scope);
    } else {

      simulator.once('createScope', event => {
        this.installForScope(event.scope);
      });
    }

  };

  this.installForScope = function(scope) {

    const pauseNext = (event) => {
      const {
        action,
        scope: enterScope,
        element
      } = event;

      if (action !== 'enter') {
        return;
      }

      if (scope !== enterScope) {
        return;
      }

      if (!is(element, 'bpmn:Activity')) {
        return;
      }

      const wait = simulator.getConfig(element).wait;

      simulator.waitAtElement(element, true);

      simulator.off('trace', pauseNext);

      simulator.once('tick', () => {
        simulator.waitAtElement(element, wait);
      });
    };

    simulator.on('trace', pauseNext);
  };

}

Stepper.$inject = [ 'simulator' ];