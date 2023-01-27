export function resolveAfter<T>(timeout: number, result: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), timeout);
  });
}

export function rejectAfter(timeout: number, reason: any): Promise<any> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(reason), timeout);
  });
}

export const DEFAULT_REASON = new Error('timeout');

export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  reason: any = DEFAULT_REASON
): Promise<T> {
  return Promise.race([rejectAfter(ms, reason), promise]);
}
