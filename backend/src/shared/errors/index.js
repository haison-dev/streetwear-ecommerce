export class AppError extends Error {
  constructor(status, message, options = {}) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = options.code;
    this.details = options.details;
  }
}

export const makeError = (status, message, options = {}) => new AppError(status, message, options);

export const badRequest = (message, options) => makeError(400, message, options);
export const unauthorized = (message = "Unauthorized", options) => makeError(401, message, options);
export const forbidden = (message = "Forbidden", options) => makeError(403, message, options);
export const notFound = (message = "Not found", options) => makeError(404, message, options);
export const conflict = (message = "Conflict", options) => makeError(409, message, options);

