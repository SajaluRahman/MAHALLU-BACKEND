import mongoose, { Document } from 'mongoose';
import { AttendanceStatus } from '@mahallu/shared-types';
export interface AttendanceDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    entityType: 'student' | 'teacher' | 'member';
    entityId: mongoose.Types.ObjectId;
    classId?: mongoose.Types.ObjectId;
    madrasaId?: mongoose.Types.ObjectId;
    date: Date;
    status: AttendanceStatus;
    markedById: mongoose.Types.ObjectId;
    note?: string;
}
export declare const Attendance: mongoose.Model<AttendanceDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=Attendance.d.ts.map