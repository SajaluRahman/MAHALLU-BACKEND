import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class MemberController {
    static getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getQRCard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static search(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=member.controller.d.ts.map