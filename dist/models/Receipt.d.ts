import mongoose, { Document } from 'mongoose';
export interface ReceiptDocument extends Document {
    tenantId: mongoose.Types.ObjectId;
    receiptNo: string;
    paymentId: mongoose.Types.ObjectId;
    pdfUrl?: string;
    publicId?: string;
    printedAt?: Date;
    sentVia?: string[];
}
export declare const Receipt: mongoose.Model<ReceiptDocument, {}, {}, {}, mongoose.Document<unknown, {}, ReceiptDocument, {}, {}> & ReceiptDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Receipt.d.ts.map