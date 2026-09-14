export class PortalError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}

export async function portalRequest<T>(
  path: string,
  payload?: unknown,
): Promise<T> {
  const response = await fetch(`/api/portal/${path}`, {
    method: payload === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers:
      payload === undefined
        ? { Accept: "application/json" }
        : { "Content-Type": "application/json", Accept: "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data = await response
    .json()
    .catch(() => ({ error: "service_unavailable" }));
  if (!response.ok) {
    if (
      response.status === 401 &&
      data.error === "unauthorized" &&
      path.startsWith("admin/") &&
      !/admin\/(login|enroll|me)/.test(path)
    )
      window.dispatchEvent(new Event("aurevia:admin-expired"));
    throw new PortalError(data.error ?? "service_unavailable", response.status);
  }
  return data as T;
}
