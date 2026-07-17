import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@mahallu/shared-types';
import { Permission } from '@mahallu/shared-config';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        tenantId: string;
        role: UserRole;
        permissions: string[];
        name: string;
    };
}
export declare const authenticate: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...permissions: Permission[]) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (...roles: UserRole[]) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const tenantMiddleware: (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map