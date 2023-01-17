export type Result<T, E = Error> =
  | { type: 'ok'; value: T }
  | { type: 'err'; error: E };

export function ok<T>(value: T): Result<T> {
  return { type: 'ok', value };
}

export function err<T>(error: Error): Result<T> {
  return { type: 'err', error };
}
