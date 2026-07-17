import mongoose, { Document } from 'mongoose';
export interface TeacherDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    memberId: mongoose.Types.ObjectId;
    madrasaId: mongoose.Types.ObjectId;
    employeeId: string;
    subjects: string[];
    qualification: string;
    experience?: number;
    salary: number;
    joiningDate: Date;
    status: 'active' | 'resigned' | 'terminated';
    documents: Array<{
        url: string;
        publicId?: string;
        fileName?: string;
        fileType?: string;
        size?: number;
    }>;
    bankAccount?: {
        bankName: string;
        accountNo: string;
        ifscCode: string;
        accountType: string;
    };
}
export declare const Teacher: mongoose.Model<TeacherDocument, {}, {}, {}, mongoose.Document<unknown, {}, TeacherDocument, {}, {}> & TeacherDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Teacher.d.ts.map