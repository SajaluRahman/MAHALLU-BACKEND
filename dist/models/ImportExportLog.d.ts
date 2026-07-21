import mongoose, { Document } from 'mongoose';
export interface IImportExportLog extends Document {
    tenantId: mongoose.Types.ObjectId;
    type: 'IMPORT' | 'EXPORT';
    entity: string;
    fileName: string;
    status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
    totalRecords: number;
    successCount: number;
    failedCount: number;
    errorDetails: Array<{
        row: number;
        message: string;
    }>;
    performedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ImportExportLog: mongoose.Model<IImportExportLog, {}, {}, {}, Document<unknown, {}, IImportExportLog, {}, {}> & IImportExportLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ImportExportLog.d.ts.map