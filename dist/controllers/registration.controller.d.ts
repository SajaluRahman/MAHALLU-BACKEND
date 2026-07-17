import { Request, Response } from 'express';
export declare const submitRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPendingRegistrations: (req: Request, res: Response) => Promise<void>;
export declare const rejectRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const approveRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=registration.controller.d.ts.map