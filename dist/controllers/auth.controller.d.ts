import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AuthController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static me(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static setup2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static verify2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static updateFCMToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map