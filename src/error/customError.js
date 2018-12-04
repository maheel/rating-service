/**
 * Custom error
 */
export default class CustomError extends Error {
  constructor(message, status = 400, errors = []) {
    super(message);
    this.description = message;
    this.code = parseInt(status, 10);

    if (errors.length > 0) {
      this.details = errors;
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
