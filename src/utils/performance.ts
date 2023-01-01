export async function measured<T>(
  name: string,
  callback: () => Promise<T>
): Promise<T> {
  startMeasure(name);
  try {
    return await callback();
  } finally {
    endMeasure(name);
  }
}

export function startMeasure(name: string) {
  performance.mark(`start:${name}`);
}

export function endMeasure(name: string) {
  const endMark = `end:${name}`;
  performance.mark(endMark);
  performance.measure(name, `start:${name}`, endMark);
}
