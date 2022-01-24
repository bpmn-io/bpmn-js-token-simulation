export function filterSet(set, matchFn) {

  const matched = [];

  for (const el of set) {
    if (matchFn(el)) {
      matched.push(el);
    }
  }

  return matched;
}

export function findSet(set, matchFn) {

  for (const el of set) {
    if (matchFn(el)) {
      return el;
    }
  }

  return null;
}