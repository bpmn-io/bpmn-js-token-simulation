export function eventsMatch(a, b) {
  const attrMatch = [ 'type', 'name', 'iref' ].every(attr => !(attr in a) || a[attr] === b[attr]);
  const catchAllMatch = !b.ref && (b.type === 'error' || b.type === 'escalation');

  return attrMatch && (catchAllMatch || refsMatch(a, b));
}

export function refsMatch(a, b) {
  const attr = 'ref';
  return !(attr in a) || a[attr] === b[attr];
}