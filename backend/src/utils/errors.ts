/** HTTP error with a status code and machine-readable code. */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (msg: string, details?: unknown) =>
  new HttpError(400, msg, "BAD_REQUEST", details);
export const unauthorized = (msg = "Unauthorized.") => new HttpError(401, msg, "UNAUTHORIZED");
export const forbidden = (msg = "Forbidden.") => new HttpError(403, msg, "FORBIDDEN");
export const notFound = (msg = "Not found.") => new HttpError(404, msg, "NOT_FOUND");
export const conflict = (msg: string) => new HttpError(409, msg, "CONFLICT");
export const unprocessable = (msg: string, details?: unknown) =>
  new HttpError(422, msg, "UNPROCESSABLE_ENTITY", details);
export const tooMany = (msg = "Too many requests.") => new HttpError(429, msg, "TOO_MANY_REQUESTS");
