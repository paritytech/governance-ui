import { Result, ok, err } from '.';

export async function fetchJSON<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Result<T>> {
  return fetch(input, init)
    .then(async (resp) => {
      if (resp.ok) {
        return ok(await resp.json());
      } else {
        return err(new Error(''));
      }
    })
    .catch((e) => {
      if (e instanceof Error) {
        return err(e);
      } else {
        return err(new Error(`${e}`));
      }
    });
}
