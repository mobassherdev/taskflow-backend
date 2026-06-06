export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors: Record<string, string>[] = [],
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
