import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: string[];
    constructor(message: string, statusCode?: number, errors?: string[]);
}
export declare const errorHandler: (err: any, _req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map