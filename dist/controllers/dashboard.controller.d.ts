import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class DashboardController {
    static getKPIs(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getIncomeExpenseChart(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getAttendanceChart(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getMemberGrowthChart(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getRecentActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map