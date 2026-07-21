import mongoose, { Document } from 'mongoose';
export interface ClassDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    madrasaId: mongoose.Types.ObjectId;
    name: string;
    level: number;
    teacherId?: mongoose.Types.ObjectId;
    students: mongoose.Types.ObjectId[];
    subjects: string[];
    schedule: Array<{
        day: string;
        startTime: string;
        endTime: string;
        subject: string;
    }>;
    academicYear: string;
}
export declare const Class: mongoose.Model<ClassDocument, {}, {}, {}, Document<unknown, {}, ClassDocument, {}, {}> & ClassDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Class.d.ts.map