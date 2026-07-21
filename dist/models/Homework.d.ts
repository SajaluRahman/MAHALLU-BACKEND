import mongoose, { Document } from 'mongoose';
export interface HomeworkDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    subject: string;
    title: string;
    description?: string;
    dueDate: Date;
    attachments: Array<{
        url: string;
        fileName: string;
        fileType: string;
    }>;
    submissions: Array<{
        studentId: mongoose.Types.ObjectId;
        submittedAt: Date;
        attachments: Array<{
            url: string;
            fileName: string;
        }>;
        grade?: number;
        feedback?: string;
        gradedAt?: Date;
    }>;
}
export declare const Homework: mongoose.Model<HomeworkDocument, {}, {}, {}, any, any>;
//# sourceMappingURL=Homework.d.ts.map