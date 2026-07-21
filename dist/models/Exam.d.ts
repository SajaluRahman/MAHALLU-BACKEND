import mongoose, { Document } from 'mongoose';
export interface ExamDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    madrasaId: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    title: string;
    subjects: string[];
    date: Date;
    totalMarks: number;
    passMark: number;
    results: Array<{
        studentId: mongoose.Types.ObjectId;
        marks: Array<{
            subject: string;
            marksObtained: number;
            totalMarks: number;
        }>;
        totalObtained: number;
        percentage: number;
        grade: string;
        isPassed: boolean;
        remarks?: string;
    }>;
    isPublished: boolean;
}
export declare const Exam: mongoose.Model<ExamDocument, {}, {}, {}, Document<unknown, {}, ExamDocument, {}, {}> & ExamDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Exam.d.ts.map