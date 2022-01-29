export function eventsMatch(a, b) {
  return [ 'type', 'name', 'ref', 'iref' ].every(attr => !(attr in a) || a[attr] === b[attr]);
}