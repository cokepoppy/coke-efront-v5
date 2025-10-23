import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError } from './error.middleware';
import prisma from '../../database/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roleId: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'No token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      roleId: string;
    };

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, roleId: true, status: true },
    });

    if (!user || user.status !== 'active') {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid token');
    }

    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.roleId || '',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'UNAUTHORIZED', 'Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      }

      const userRole = await prisma.role.findUnique({
        where: { id: req.user.roleId },
      });

      if (!userRole || !allowedRoles.includes(userRole.name)) {
        throw new AppError(
          403,
          'FORBIDDEN',
          'You do not have permission to perform this action'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
