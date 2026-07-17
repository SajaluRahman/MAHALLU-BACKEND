import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const requestLogger: (req: Request, _res: Response, next: NextFunction) => void;
export declare const auditLog: (entity: string, action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "EXPORT") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=requestLogger.d.ts.map