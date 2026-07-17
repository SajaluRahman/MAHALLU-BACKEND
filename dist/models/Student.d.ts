import mongoose, { Document } from 'mongoose';
export interface StudentDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    admissionNo: string;
    memberId: mongoose.Types.ObjectId;
    madrasaId: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    batchId?: mongoose.Types.ObjectId;
    guardianId: mongoose.Types.ObjectId;
    familyId?: mongoose.Types.ObjectId;
    admissionDate: Date;
    status: 'active' | 'promoted' | 'transferred' | 'withdrawn';
    qrCode?: string;
    idCardUrl?: string;
    hifzProgress?: {
        completedJuz: number[];
        currentJuz: number;
        currentSurah: string;
        lastAssessedAt: Date;
    };
    tajweedLevel?: string;
    feePaid: number;
    feeBalance: number;
    isDeleted: boolean;
    deletedAt?: Date;
}
export declare const Student: mongoose.Model<StudentDocument, {}, {}, {}, mongoose.Document<unknown, {}, StudentDocument, {}, {}> & StudentDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Student.d.ts.map