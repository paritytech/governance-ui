export function areEquals<T>(set1: Set<T>, set2: Set<T>): boolean {
  // Sets equality consider insertion order, roll on our own
  return set1.size == set2.size && [...set1].every((x) => set2.has(x));
}

/**
 * @param set1
 * @param set2
 * @returns the difference between 2 sets
 */
export function difference<T>(set1: Set<T>, set2: Set<T>): Set<T> {
  return new Set([...set1].filter((x) => !set2.has(x)));
}
