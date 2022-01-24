export function eventsMatch(a, b) {
  return [ 'type', 'name', 'ref' ].every(attr => !(attr in a) || a[attr] === b[attr]);
}