import {
  is
} from '../../util/ElementHelper';

import {
  TOGGLE_MODE_EVENT
} from '../../util/EventHelper';

const STYLE = getComputedStyle(document.documentElement);

const NOT_SELECTED_COLOR = STYLE.getPropertyValue('--token-simulation-grey-lighten-56');
const SELECTED_COLOR = STYLE.getPropertyValue('--token-simulation-grey-darken-30');


function getNext(gateway, sequenceFlow) {
  var outgoing = gateway.outgoing.filter(isSequenceFlow);

  var index = outgoing.indexOf(sequenceFlow || gateway.sequenceFlow);

  if (outgoing[index + 1]) {
    return outgoing[index + 1];
  } else {
    return outgoing[0];
  }
}

function isSequenceFlow(connection) {
  return is(connection, 'bpmn:SequenceFlow');
}


export default function ExclusiveGatewaySettings(
    eventBus, elementRegistry,
    graphicsFactory, simulator) {

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;
  this._simulator = simulator;

  eventBus.on(TOGGLE_MODE_EVENT, event => {
    if (event.active) {
      this.setSequenceFlowsDefault();
    } else {
      this.resetSequenceFlows();
    }
  });
}

ExclusiveGatewaySettings.prototype.setSequenceFlowsDefault = function() {
  const exclusiveGateways = this._elementRegistry.filter(element => {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  for (const gateway of exclusiveGateways) {
    this.setSequenceFlow(gateway);
  }
};

ExclusiveGatewaySettings.prototype.resetSequenceFlows = function() {

  const exclusiveGateways = this._elementRegistry.filter(element => {
    return is(element, 'bpmn:ExclusiveGateway');
  });

  exclusiveGateways.forEach(exclusiveGateway => {
    if (exclusiveGateway.outgoing.filter(isSequenceFlow).length) {
      this.resetSequenceFlow(exclusiveGateway);
    }
  });
};

ExclusiveGatewaySettings.prototype.resetSequenceFlow = function(gateway) {
  this._simulator.setConfig(gateway, { activeOutgoing: undefined });
};

ExclusiveGatewaySettings.prototype.setSequenceFlow = function(gateway) {

  const outgoing = gateway.outgoing.filter(isSequenceFlow);

  if (!outgoing.length) {
    return;
  }

  const {
    activeOutgoing
  } = this._simulator.getConfig(gateway);

  let newActiveOutgoing;

  if (activeOutgoing) {

    // set next sequence flow
    newActiveOutgoing = getNext(gateway, activeOutgoing);
  } else {

    // set first sequence flow
    newActiveOutgoing = outgoing[ 0 ];
  }

  this._simulator.setConfig(gateway, { activeOutgoing: newActiveOutgoing });

  // set colors
  gateway.outgoing.forEach(outgoing => {
    this.setColor(
      outgoing, outgoing === newActiveOutgoing ? SELECTED_COLOR : NOT_SELECTED_COLOR
    );
  });
};

ExclusiveGatewaySettings.prototype.setColor = function(sequenceFlow, color) {

  const label = sequenceFlow.label;
  const businessObject = sequenceFlow.businessObject;

  businessObject.di.set('stroke', color);

  const gfx = this._elementRegistry.getGraphics(sequenceFlow);

  this._graphicsFactory.update('connection', sequenceFlow, gfx);

  if (label) {
    this._graphicsFactory.update('connection', label, this._elementRegistry.getGraphics(label));
  }
};

ExclusiveGatewaySettings.$inject = [
  'eventBus',
  'elementRegistry',
  'graphicsFactory',
  'simulator'
];