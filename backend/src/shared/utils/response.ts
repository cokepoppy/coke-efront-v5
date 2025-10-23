import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/response';

export class ResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    details?: any,
    statusCode = 400
  ) {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    pageSize: number,
    total: number
  ) {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      timestamp: new Date().toISOString(),
    };
    return res.status(200).json(response);
  }
}
