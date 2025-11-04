import { Request, Response, NextFunction } from 'express';

export interface ErrorResponse extends Error {
  statusCode?: number;
  errors?: any;
}

export const errorHandler = (
  err: ErrorResponse,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'CastError', message };
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = { name: 'DuplicateError', message };
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = { name: 'ValidationError', message };
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    errors: error.errors,
  });
};
