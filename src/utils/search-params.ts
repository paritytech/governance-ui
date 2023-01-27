export function extractSearchParams(
  search: string,
  params: string[]
): Array<string | null> {
  const searchParams = new URLSearchParams(search);
  return params.map((param) => searchParams.get(param));
}
