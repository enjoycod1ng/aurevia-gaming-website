export class PortalError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}

// Shared by JSON requests and downloads, so an expired admin session signs the
// workspace out whichever kind of request discovers it.
async function portalFailure(
  response: Response,
  path: string,
): Promise<PortalError> {
  const data = await response
    .json()
    .catch(() => ({ error: "service_unavailable" }));
  if (
    response.status === 401 &&
    data.error === "unauthorized" &&
    path.startsWith("admin/") &&
    !/admin\/(login|enroll|me)/.test(path)
  )
    window.dispatchEvent(new Event("aurevia:admin-expired"));
  return new PortalError(data.error ?? "service_unavailable", response.status);
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
  if (!response.ok) throw await portalFailure(response, path);
  return (await response
    .json()
    .catch(() => ({ error: "service_unavailable" }))) as T;
}

export async function portalDownload(path: string): Promise<Blob> {
  const response = await fetch(`/api/portal/${path}`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) throw await portalFailure(response, path);
  return response.blob();
}
