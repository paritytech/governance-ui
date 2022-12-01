export function fetchQuery<T>(input: RequestInfo | URL, query: string, variables: Record<string, any> = {}, defaultInit?: RequestInit): Promise<T> {
  const init = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      query,
      variables
    })
  };
  return fetch(input, { ...init, ...defaultInit }).then(res => res.json()).then(res => res.data);
}