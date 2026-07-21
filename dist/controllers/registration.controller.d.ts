import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const submitRegistration: (req: Request, res: Response) => unknown;
export declare const getFamiliesForRegistration: (req: Request, res: Response) => unknown;
export declare const getPendingRegistrations: (req: AuthRequest, res: Response) => any;
export declare const rejectRegistration: (req: AuthRequest, res: Response) => unknown;
export declare const approveRegistration: (req: AuthRequest, res: Response) => unknown;
//# sourceMappingURL=registration.controller.d.ts.map