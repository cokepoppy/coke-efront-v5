import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return ResponseUtil.error(
      res,
      err.code,
      err.message,
      err.details,
      err.statusCode
    );
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return ResponseUtil.error(
      res,
      'DATABASE_ERROR',
      'Database operation failed',
      process.env.NODE_ENV === 'development' ? err.message : undefined,
      500
    );
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return ResponseUtil.error(res, 'VALIDATION_ERROR', err.message, null, 400);
  }

  // Default error
  return ResponseUtil.error(
    res,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? err.stack : undefined,
    500
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  ResponseUtil.error(
    res,
    'NOT_FOUND',
    `Route ${req.method} ${req.path} not found`,
    null,
    404
  );
};
