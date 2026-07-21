import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ImportExportController {
    /**
     * Download Demo Excel Template for importing Families and Members
     */
    static downloadTemplate(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Bulk Import Families and Members from Excel / CSV
     */
    static importData(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Export All Families & Members as Excel Workbook
     */
    static exportData(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get Import & Export History Logs
     */
    static getHistory(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=importExport.controller.d.ts.map