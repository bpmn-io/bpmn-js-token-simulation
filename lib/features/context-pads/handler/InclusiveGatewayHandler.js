import {
  ForkIcon
} from '../../../icons';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { isSequenceFlow } from '../../../simulator/util/ModelUtil';

// how far (px) a point on a flow must be from every sibling flow for the
// flow to count as "diverged" - roughly the toggle button size, so buttons
// end up on visually distinct parts of their flows
const SEPARATION = 30;

// step used when scanning a flow for its divergence point
const SAMPLE_STEP = 8;

// once a flow has diverged, push the anchor a little further so the button
// sits clearly past the corner rather than right on it
const DIVERGENCE_MARGIN = 20;

// fallback (flows never diverge, e.g. fully overlapping): distance along the
// flow for the first button ...
const FLOW_ANCHOR_DISTANCE = 40;

// ... and how much each subsequent button is pushed further along its flow
const FLOW_ANCHOR_STEP = 32;

// keep the anchor off the very end of short flows
const FLOW_ANCHOR_END_MARGIN = 20;

export default function InclusiveGatewayHandler(inclusiveGatewaySettings) {
  this._inclusiveGatewaySettings = inclusiveGatewaySettings;
}

InclusiveGatewayHandler.prototype.createContextPads = function(element) {
  const outgoingFlows = element.outgoing.filter(isSequenceFlow);

  if (outgoingFlows.length < 2) {
    return;
  }

  const nonDefaultFlows = outgoingFlows.filter(outgoing => {
    const flowBo = getBusinessObject(outgoing),
          gatewayBo = getBusinessObject(element);

    return gatewayBo.default !== flowBo;
  });

  const html = `
    <button class="bts-context-pad" title="Set Sequence Flow">
      ${ForkIcon()}
    </button>
  `;

  return nonDefaultFlows.map((sequenceFlow, index) => {
    const action = () => {
      this._inclusiveGatewaySettings.toggleSequenceFlow(element, sequenceFlow);
    };

    const siblings = outgoingFlows.filter(flow => flow !== sequenceFlow);

    return {
      action,
      element: sequenceFlow,
      html,
      position: getFlowAnchor(sequenceFlow, index, siblings)
    };
  });
};

InclusiveGatewayHandler.$inject = [
  'inclusiveGatewaySettings'
];


// helpers ///////////////

/**
 * Absolute point (diagram coordinates) at which the toggle button for a
 * sequence flow should be centered.
 *
 * Gateways commonly route several outgoing flows over a shared trunk (e.g. a
 * vertical segment) before they branch off to their targets. Anchoring the
 * button where the flow first separates from all its siblings puts it on a
 * part of the flow that is unambiguously its own, so buttons no longer pile
 * up near the gateway.
 *
 * @param {Object} sequenceFlow
 * @param {Number} index
 * @param {Array<Object>} siblings other outgoing flows of the same gateway
 *
 * @return {{ x: Number, y: Number }|null}
 */
function getFlowAnchor(sequenceFlow, index, siblings) {
  const waypoints = sequenceFlow.waypoints;

  if (!waypoints || waypoints.length < 2) {
    return null;
  }

  const length = getFlowLength(waypoints);

  // never place the anchor past the flow; keep it off the target end
  const maxDistance = Math.max(length - FLOW_ANCHOR_END_MARGIN, length / 2);

  const siblingWaypoints = siblings
    .map(flow => flow.waypoints)
    .filter(wps => wps && wps.length >= 2);

  const divergence = getDivergenceDistance(waypoints, siblingWaypoints, length);

  const distanceAlong = divergence === null

    // flows never separate (fully overlapping / no siblings): fall back to a
    // fixed, per-flow-staggered distance
    ? FLOW_ANCHOR_DISTANCE + index * FLOW_ANCHOR_STEP

    // place the button just past the point where the flow becomes distinct
    : divergence + DIVERGENCE_MARGIN;

  return getPointAlong(waypoints, Math.min(distanceAlong, maxDistance));
}

/**
 * Distance along <waypoints> at which the flow is at least SEPARATION px away
 * from every sibling flow, or null if that never happens.
 */
function getDivergenceDistance(waypoints, siblingWaypoints, length) {
  if (!siblingWaypoints.length) {
    return null;
  }

  for (let d = 0; d <= length; d += SAMPLE_STEP) {
    const point = getPointAlong(waypoints, d);

    const clearOfAll = siblingWaypoints.every(
      wps => getDistanceToPolyline(point, wps) >= SEPARATION
    );

    if (clearOfAll) {
      return d;
    }
  }

  return null;
}

function distance(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Shortest distance from point <p> to a polyline.
 */
function getDistanceToPolyline(p, waypoints) {
  let min = Infinity;

  for (let i = 0; i < waypoints.length - 1; i++) {
    min = Math.min(min, getDistanceToSegment(p, waypoints[i], waypoints[i + 1]));
  }

  return min;
}

/**
 * Shortest distance from point <p> to the segment <a>-<b>.
 */
function getDistanceToSegment(p, a, b) {
  const dx = b.x - a.x,
        dy = b.y - a.y;

  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return distance(p, a);
  }

  // projection of p onto the segment, clamped to [0, 1]
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared;

  t = Math.max(0, Math.min(1, t));

  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

function getFlowLength(waypoints) {
  let length = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    length += distance(waypoints[i], waypoints[i + 1]);
  }

  return length;
}

/**
 * Point <d> px along the polyline, measured from its start
 * (the gateway/source side, since waypoints run source -> target).
 */
function getPointAlong(waypoints, d) {
  let remaining = d;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i],
          end = waypoints[i + 1];

    const segment = distance(start, end);

    if (segment >= remaining) {
      const t = segment === 0 ? 0 : remaining / segment;

      return {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t
      };
    }

    remaining -= segment;
  }

  const last = waypoints[waypoints.length - 1];

  return { x: last.x, y: last.y };
}