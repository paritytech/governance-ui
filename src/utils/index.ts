export type Result<T, E = Error> =
  | { type: 'ok'; value: T }
  | { type: 'err'; error: E };

export function ok<T>(value: T): Result<T> {
  return { type: 'ok', value };
}

export function err<T>(error: Error): Result<T> {
  return { type: 'err', error };
}

// https://imhoff.blog/posts/using-results-in-typescript
// https://github.com/everweij/typescript-result
// https://zanza00.gitbook.io/learn-fp-ts/option
// https://github.com/shogogg/ts-option/blob/master/index.ts
