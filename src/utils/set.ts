export function areEquals<T>(set1: Set<T>, set2: Set<T>): boolean {
  // Sets equality consider insertion order, roll on our own
  return set1.size == set2.size && [...set1].every((x) => set2.has(x));
}
