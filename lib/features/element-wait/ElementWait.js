import { some } from 'min-dash';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { TOGGLE_AUTOMATIC_MODE_EVENT } from '../../util/EventHelper';

export default function ElementWait(eventBus, elementRegistry, simulator) {

  this._types = new Set([
    'bpmn:BusinessRuleTask',
    'bpmn:CallActivity',
    'bpmn:ManualTask',
    'bpmn:ScriptTask',
    'bpmn:SendTask',
    'bpmn:ServiceTask',
    'bpmn:Task',
    'bpmn:UserTask'
  ]);

  eventBus.on(TOGGLE_AUTOMATIC_MODE_EVENT, (ctx) => {

    let elementsToUpdate = elementRegistry.filter(el => {
      return some([...this._types], type => is(el, type));
    });

    elementsToUpdate.forEach(element => {
      simulator.waitAtElement(element, !ctx.automaticMode);
    });
  });

  this.waitForType = function(type) {
    this._types.add(type);
  };

  this.stopWaitingForType = function(type) {
    this._types.delete(type);
  };
}

ElementWait.$inject = ['eventBus', 'elementRegistry', 'simulator'];