import mongoose, { Document } from 'mongoose';
export interface TransactionDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
    date: Date;
    description: string;
    referenceNo?: string;
    recordedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Transaction: mongoose.Model<TransactionDocument, {}, {}, {}, Document<unknown, {}, TransactionDocument, {}, {}> & TransactionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Transaction.d.ts.map