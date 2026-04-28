export function toUrlSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (value !== undefined) {
      params.set(key, value);
    }
  }

  return params;
}

export function buildSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | number | null | undefined | string[]>,
) {
  const params = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    params.delete(key);

    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) {
          params.append(key, item);
        }
      }
      continue;
    }

    params.set(key, String(value));
  }

  return params.toString();
}
