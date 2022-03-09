/**
 * Wrapper for fetch that will timeout after a set amount of time.
 * @param RequestInit takes an optional `timeout` field (in ms)
 */
export const fetchWithTimeout: typeof fetch = async (
  input: RequestInfo,
  init?: RequestInit & { timeout?: number },
) => {
  const { timeout = 8000, ...options } = init || {};

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(input, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
};
