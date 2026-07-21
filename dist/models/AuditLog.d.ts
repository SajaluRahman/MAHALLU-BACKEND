import mongoose, { Document } from 'mongoose';
import { IAuditLog } from '@mahallu/shared-types';
export interface AuditLogDocument extends Omit<IAuditLog, '_id' | 'tenantId' | 'userId' | 'entityId'>, Document {
    tenantId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    entityId?: mongoose.Types.ObjectId;
}
export declare const AuditLog: mongoose.Model<AuditLogDocument, {}, {}, {}, Document<unknown, {}, AuditLogDocument, {}, {}> & AuditLogDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditLog.d.ts.map