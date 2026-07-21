import mongoose, { Document } from 'mongoose';
export interface SurveyDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    questions: Array<{
        _id: mongoose.Types.ObjectId;
        question: string;
        type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'boolean';
        options?: string[];
        isRequired: boolean;
    }>;
    responses: Array<{
        memberId?: mongoose.Types.ObjectId;
        respondedAt: Date;
        answers: Array<{
            questionId: mongoose.Types.ObjectId;
            answer: string | string[];
        }>;
    }>;
    isActive: boolean;
    expiresAt?: Date;
}
export declare const Survey: mongoose.Model<SurveyDocument, {}, {}, {}, Document<unknown, {}, SurveyDocument, {}, {}> & SurveyDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Survey.d.ts.map