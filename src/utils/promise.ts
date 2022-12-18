export function wait(ms: number, reason: string = 'timeout'): Promise<any> {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(reason));
    }, ms);
  });
}

export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  reason: string = 'timeout'
): Promise<T> {
  return Promise.race([wait(ms, reason), promise]);
}
