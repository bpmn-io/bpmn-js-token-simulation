import {
  is,
  isCompensationActivity,
  isCompensationEvent
} from '../../simulator/util/ModelUtil';


export function enterAfterCompensationAnimation(animation, context, enter) {

  const {
    element,
    scope
  } = context;

  const compensationAssociation = findCompensationAssociation(element);

  if (!compensationAssociation) {
    return enter();
  }

  animation.animate(compensationAssociation, scope, enter);
}

function findCompensationAssociation(element) {

  if (!isCompensationActivity(element)) {
    return null;
  }

  return element.incoming.find(
    connection => is(connection, 'bpmn:Association') && isCompensationEvent(connection.source)
  );
}
