import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ResponseUtil } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const user = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
      });
      ResponseUtil.success(res, user, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      ResponseUtil.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      ResponseUtil.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.getProfile(req.user!.id);
      ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, phone, avatarUrl } = req.body;
      const user = await this.authService.updateProfile(req.user!.id, {
        firstName,
        lastName,
        phone,
        avatarUrl,
      });
      ResponseUtil.success(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await this.authService.changePassword(
        req.user!.id,
        oldPassword,
        newPassword
      );
      ResponseUtil.success(res, result, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  };
}
