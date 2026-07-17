import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const submitRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFamiliesForRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPendingRegistrations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const rejectRegistration: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const approveRegistration: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=registration.controller.d.ts.map